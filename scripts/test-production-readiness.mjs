import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('====================================================');
  console.log('GDG LASU Bootcamp LMS: Production-Readiness Suite');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Database Connection & Health
    // ----------------------------------------------------
    console.log('\n--- 1. Database Connection & Schema Health ---');
    const userCount = await prisma.user.count();
    const trackCount = await prisma.track.count();
    const inviteCount = await prisma.invite.count();
    assert(userCount >= 0, `Database connected. Users count: ${userCount}`);
    assert(trackCount >= 0, `Tracks count: ${trackCount}`);
    assert(inviteCount >= 0, `Invites count: ${inviteCount}`);

    // Verify relations and safety
    const submissionCount = await prisma.submission.count();
    const attendanceCount = await prisma.attendance.count();
    assert(submissionCount >= 0, `Submissions table active: ${submissionCount}`);
    assert(attendanceCount >= 0, `Attendance table active: ${attendanceCount}`);

    // ----------------------------------------------------
    // TEST 2: Password Hash Exposure Check
    // ----------------------------------------------------
    console.log('\n--- 2. Sensitive Field Isolation (No passwordHash exposed) ---');
    const firstUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        role: true,
      },
    });

    if (firstUser) {
      assert(!('passwordHash' in firstUser), 'Safe Prisma select isolates passwordHash from model object');
    }

    // ----------------------------------------------------
    // TEST 3: Auth Flow (Registration, Login, Cookie, Session)
    // ----------------------------------------------------
    console.log('\n--- 3. Auth Flow (Registration, Login, Role Isolation) ---');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    // Register
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Production',
        lastName: 'Tester',
        email: testEmail,
        password: testPassword,
        role: 'STUDENT',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, `Registration succeeded with 201 Created`);
    assert(regData.user?.email === testEmail, `Registered user email matches: ${regData.user?.email}`);
    assert(!regData.user?.passwordHash, `Registration response contains no passwordHash`);

    // Login with valid credentials
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    const cookie = loginRes.headers.get('set-cookie');
    assert(loginRes.status === 200, `Login succeeded with 200 OK`);
    assert(cookie && cookie.includes('bootcamp_lms_session='), `Auth token HTTP-only cookie set`);
    assert(!loginData.user?.passwordHash, `Login response contains no passwordHash`);

    // Login with invalid credentials
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123!',
      }),
    });
    assert(badLoginRes.status === 401, `Invalid password rejected with 401 Unauthorized`);

    // Inactive account rejection test
    const inactiveUser = await prisma.user.create({
      data: {
        email: `inactive_${Date.now()}@example.com`,
        firstName: 'Inactive',
        lastName: 'User',
        passwordHash: await bcrypt.hash(testPassword, 10),
        role: 'STUDENT',
        isActive: false,
      },
    });

    const inactiveLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inactiveUser.email,
        password: testPassword,
      }),
    });
    const inactiveLoginData = await inactiveLoginRes.json();
    assert(inactiveLoginRes.status === 403, `Inactive user blocked with 403 Forbidden: ${inactiveLoginData.error}`);

    // Verify session /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookie },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, `/api/auth/me authenticated successfully`);
    assert(meData.user?.email === testEmail, `Session user matches registered email`);
    assert(!meData.user?.passwordHash, `/api/auth/me exposes NO passwordHash`);

    // ----------------------------------------------------
    // TEST 4: Student Flow & IDOR Restrictions
    // ----------------------------------------------------
    console.log('\n--- 4. Student Flow & IDOR Restrictions ---');
    // Student trying to access mentor/admin routes
    const adminRouteRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        firstName: 'Hacker',
        lastName: 'Admin',
        email: 'hacker@example.com',
        password: 'Password123!',
        role: 'ADMIN',
      }),
    });
    assert(adminRouteRes.status === 401 || adminRouteRes.status === 403, `Student blocked from POST /api/admin/users (${adminRouteRes.status})`);

    const mentorAttendanceRes = await fetch(`${BASE_URL}/api/mentor/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        sessionId: 'dummy-session-id',
        records: [],
      }),
    });
    assert(mentorAttendanceRes.status === 401 || mentorAttendanceRes.status === 403, `Student blocked from recording mentor attendance (${mentorAttendanceRes.status})`);

    // ----------------------------------------------------
    // TEST 5: Track & Lesson Progress API
    // ----------------------------------------------------
    console.log('\n--- 5. Tracks & Lesson Progress API ---');
    const tracksRes = await fetch(`${BASE_URL}/api/tracks`, {
      headers: { Cookie: cookie },
    });
    assert(tracksRes.status === 200, `/api/tracks loaded successfully`);
    const tracksData = await tracksRes.json();
    assert(Array.isArray(tracksData.tracks || tracksData), `/api/tracks returns array`);

    // ----------------------------------------------------
    // TEST 6: Public Invite Validation & Join
    // ----------------------------------------------------
    console.log('\n--- 6. Public Invite Code Security ---');
    const badInviteRes = await fetch(`${BASE_URL}/api/invites/validate?code=NONEXISTENT_CODE_XYZ`);
    const badInviteData = await badInviteRes.json();
    assert(badInviteRes.status === 404, `Nonexistent invite rejected with 404: ${badInviteData.error}`);

    // Cleanup test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testEmail, inactiveUser.email],
        },
      },
    });
    console.log('\n🧹 Test users cleaned up successfully');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main();
