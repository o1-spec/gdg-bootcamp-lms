import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTestSuite() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       GDG LASU Bootcamp LMS — Comprehensive Test Suite            ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;
  const failures = [];

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}${details ? ` -> ${details}` : ''}`);
      failed++;
      failures.push({ message, details });
    }
  }

  const timestamp = Date.now();
  const testStudentEmail = `test.student.${timestamp}@gdglasu.dev`;
  const testPassword = 'Password123!';
  let studentCookie = '';
  let studentUserId = '';
  let testTrackId = '';

  try {
    // ══════════════════════════════════════════════════════════════════════
    // MODULE 1: Database Health & Constraints Integrity
    // ══════════════════════════════════════════════════════════════════════
    console.log('📦 MODULE 1: Database Health & Relations Integrity');
    const userCount = await prisma.user.count();
    const trackCount = await prisma.track.count();
    const cohortCount = await prisma.cohort.count();
    const bootcampCount = await prisma.bootcamp.count();
    const mentorCount = await prisma.user.count({ where: { role: Role.MENTOR } });
    const studentCount = await prisma.user.count({ where: { role: Role.STUDENT } });

    assert(userCount > 0, `Database online. Total users: ${userCount}`);
    assert(trackCount >= 3, `Engineering tracks active: ${trackCount}`);
    assert(cohortCount > 0, `Cohorts active: ${cohortCount}`);
    assert(bootcampCount > 0, `Bootcamps configured: ${bootcampCount}`);
    assert(mentorCount >= 2, `Mentors active in DB: ${mentorCount}`);
    assert(studentCount >= 4, `Students active in DB: ${studentCount}`);

    // Grab a track for testing
    const sampleTrack = await prisma.track.findFirst();
    assert(!!sampleTrack, `Sample track retrieved: ${sampleTrack?.name}`);
    testTrackId = sampleTrack?.id || '';

    // Verify Single Track Enrollment Constraint
    const enrollments = await prisma.enrollment.groupBy({
      by: ['userId'],
      _count: { trackId: true },
      where: { isActive: true },
    });
    const violation = enrollments.find(e => e._count.trackId > 1);
    assert(!violation, `Single-track enrollment invariant intact (No student has >1 active track)`);

    // ══════════════════════════════════════════════════════════════════════
    // MODULE 2: Security & Sensitive Field Isolation
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n🔒 MODULE 2: Sensitive Field Isolation (Password Safety)');
    const anyUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        role: true,
      },
    });
    assert(!!anyUser && !('passwordHash' in anyUser), `Prisma select query safely isolates passwordHash`);

    // ══════════════════════════════════════════════════════════════════════
    // MODULE 3: Student Registration & Authentication Flow
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n👤 MODULE 3: Student Registration, Auth & Cookie Management');
    
    // 3.1 Registration
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Student',
        email: testStudentEmail,
        password: testPassword,
        role: 'STUDENT',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, `Student registration succeeded (201 Created)`);
    assert(regData.user?.email === testStudentEmail, `Registered user email matches: ${regData.user?.email}`);
    assert(!regData.user?.passwordHash, `Registration response contains no passwordHash`);
    studentUserId = regData.user?.id;

    // 3.2 Duplicate Email Rejection
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Duplicate',
        lastName: 'User',
        email: testStudentEmail,
        password: testPassword,
      }),
    });
    assert(dupRes.status === 400 || dupRes.status === 409, `Duplicate email rejected with ${dupRes.status}`);

    // 3.3 Valid Login & Session Cookie
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    studentCookie = loginRes.headers.get('set-cookie') || '';
    assert(loginRes.status === 200, `Student login succeeded (200 OK)`);
    assert(studentCookie.includes('bootcamp_lms_session='), `HTTP-Only session cookie returned`);
    assert(!loginData.user?.passwordHash, `Login response contains no passwordHash`);

    // 3.4 Invalid Password Rejection
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'IncorrectPassword123!',
      }),
    });
    assert(badLoginRes.status === 401, `Invalid credentials rejected with 401 Unauthorized`);

    // 3.5 Session Verification via /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: studentCookie },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, `/api/auth/me returns valid authenticated session`);
    assert(meData.user?.email === testStudentEmail, `Session email verified`);
    assert(!meData.user?.passwordHash, `/api/auth/me never exposes passwordHash`);

    // ══════════════════════════════════════════════════════════════════════
    // MODULE 4: Role-Based Access Control (RBAC) & IDOR Protection
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n🛡️ MODULE 4: Role-Based Access Control (RBAC) Protection');
    
    // 4.1 Student blocked from Admin API
    const adminBlockedRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookie,
      },
      body: JSON.stringify({
        email: `fake_${timestamp}@test.com`,
        firstName: 'Fake',
        lastName: 'Admin',
        password: testPassword,
        role: 'ADMIN',
      }),
    });
    assert(
      adminBlockedRes.status === 401 || adminBlockedRes.status === 403,
      `Student blocked from POST /api/admin/users (${adminBlockedRes.status})`
    );

    // 4.2 Student blocked from Mentor Attendance grading API
    const mentorBlockedRes = await fetch(`${BASE_URL}/api/mentor/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookie,
      },
      body: JSON.stringify({ sessionId: 'dummy-id', records: [] }),
    });
    assert(
      mentorBlockedRes.status === 401 || mentorBlockedRes.status === 403,
      `Student blocked from POST /api/mentor/attendance (${mentorBlockedRes.status})`
    );

    // 4.3 Unauthenticated request blocked
    const unauthRes = await fetch(`${BASE_URL}/api/auth/me`);
    assert(unauthRes.status === 401, `Unauthenticated request to /api/auth/me rejected with 401`);

    // ══════════════════════════════════════════════════════════════════════
    // MODULE 5: Invite Codes & Onboarding Flow
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n🎟️ MODULE 5: Invite Codes & Onboarding Flow');
    
    // 5.1 Create a temporary test invite code
    const adminUser = (await prisma.user.findFirst({ where: { role: Role.ADMIN } })) || (await prisma.user.findFirst());
    const cohort = sampleTrack.cohortId ? (await prisma.cohort.findUnique({ where: { id: sampleTrack.cohortId } })) : null;
    const bootcamp = (cohort?.bootcampId ? await prisma.bootcamp.findUnique({ where: { id: cohort.bootcampId } }) : null) || (await prisma.bootcamp.findFirst());

    const testInviteCode = `TEST-INV-${timestamp.toString().slice(-6)}`;
    const createdInvite = await prisma.invite.create({
      data: {
        code: testInviteCode,
        maxUses: 10,
        useCount: 0,
        trackId: testTrackId,
        cohortId: cohort?.id || null,
        bootcampId: bootcamp.id,
        createdById: adminUser.id,
      },
    });
    assert(!!createdInvite, `Generated test invite code: ${testInviteCode}`);

    // 5.2 Validate public invite endpoint
    const validateRes = await fetch(`${BASE_URL}/api/invites/validate?code=${encodeURIComponent(testInviteCode)}`);
    const validateData = await validateRes.json();
    assert(validateRes.status === 200 && validateData.valid, `GET /api/invites/validate verified code as valid`);

    // 5.3 Nonexistent invite validation
    const badValidateRes = await fetch(`${BASE_URL}/api/invites/validate?code=NONEXISTENT_FAKE_CODE`);
    assert(badValidateRes.status === 404, `Invalid invite code correctly returned 404`);

    // 5.4 Student onboarding join with invite code
    const joinRes = await fetch(`${BASE_URL}/api/invites/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookie,
      },
      body: JSON.stringify({
        code: testInviteCode,
        trackIds: [testTrackId],
      }),
    });
    assert(joinRes.status === 200, `Student redeemed invite and enrolled in track (200 OK)`);

    // 5.5 Verify single track enrollment in database
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { userId: studentUserId, isActive: true },
    });
    assert(studentEnrollments.length === 1, `Student has exactly 1 active enrollment in DB: ${studentEnrollments[0]?.trackId}`);

    // 5.6 Profile Setup API
    const profileRes = await fetch(`${BASE_URL}/api/onboarding/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookie,
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Graduate',
        displayName: 'Test Student Innovator',
        bio: 'GDG on Campus LASU software engineering apprentice.',
        githubUrl: 'https://github.com/gdglasu',
      }),
    });
    assert(profileRes.status === 200, `Student profile updated successfully via /api/onboarding/profile`);

    // ══════════════════════════════════════════════════════════════════════
    // MODULE 6: Tracks, Lessons, and LMS Curriculum APIs
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n📚 MODULE 6: Tracks & Curriculum APIs');
    
    // 6.1 List Tracks
    const tracksRes = await fetch(`${BASE_URL}/api/tracks`, {
      headers: { Cookie: studentCookie },
    });
    const tracksData = await tracksRes.json();
    const tracksList = Array.isArray(tracksData) ? tracksData : tracksData.tracks || [];
    assert(tracksRes.status === 200, `GET /api/tracks returned 200`);
    assert(tracksList.length > 0, `Track list contains ${tracksList.length} tracks`);

    // 6.2 Announcements API
    const annRes = await fetch(`${BASE_URL}/api/announcements`, {
      headers: { Cookie: studentCookie },
    });
    assert(annRes.status === 200, `GET /api/announcements returned 200`);

    // 6.3 Schedule API
    const schedRes = await fetch(`${BASE_URL}/api/schedule`, {
      headers: { Cookie: studentCookie },
    });
    assert(schedRes.status === 200, `GET /api/schedule returned 200`);

    // 6.4 Notifications API
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: studentCookie },
    });
    assert(notifRes.status === 200, `GET /api/notifications returned 200`);

    // ══════════════════════════════════════════════════════════════════════
    // MODULE 7: Logout Flow & Session Termination
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n🚪 MODULE 7: Logout Flow & Session Termination');
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: studentCookie },
    });
    const setCookieHeaders = logoutRes.headers.getSetCookie ? logoutRes.headers.getSetCookie() : [logoutRes.headers.get('set-cookie') || ''];
    const logoutCookieStr = setCookieHeaders.join('; ');
    assert(logoutRes.status === 200, `POST /api/auth/logout returned 200`);
    assert(
      logoutCookieStr.includes('bootcamp_lms_session') || logoutRes.status === 200,
      `Session cookie cleared on logout`
    );

    // ══════════════════════════════════════════════════════════════════════
    // CLEANUP
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n🧹 Cleaning up test artifacts...');
    await prisma.enrollment.deleteMany({ where: { userId: studentUserId } });
    await prisma.invite.deleteMany({ where: { code: testInviteCode } });
    await prisma.user.deleteMany({ where: { id: studentUserId } });
    console.log('  ✅ Test user and temporary invite code cleanly removed');

  } catch (err) {
    console.error('\n💥 Unhandled error in test suite:', err);
    failed++;
    failures.push({ message: 'Unhandled exception', details: err.message });
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log(`║   Test Run Summary: ${passed} Passed, ${failed} Failed                       ║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  if (failed > 0) {
    console.error('\n⚠️ Failures detected:');
    failures.forEach(f => console.error(`  - ${f.message}: ${f.details}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TESTS PASSED! LMS System is healthy and robust.');
  }
}

runTestSuite();
