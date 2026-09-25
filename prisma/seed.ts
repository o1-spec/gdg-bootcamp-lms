import { PrismaClient, Role, ResourceType, AssignmentType, SessionMode, AnnouncementPriority, SubmissionStatus, AttendanceStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.mentorAssignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.track.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.bootcamp.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing records");

  // Hash development password (support both password123 and Password123!)
  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  const defaultPreferences = {
    assignments: true,
    sessions: true,
    resources: true,
    announcements: true,
    feedback: true,
  };

  // 1. Create Users
  const student1 = await prisma.user.create({
    data: {
      firstName: "Tobi",
      lastName: "Adebayo",
      email: "student@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      firstName: "Kehinde",
      lastName: "Balogun",
      email: "kehinde@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      firstName: "Amaka",
      lastName: "Eze",
      email: "amaka@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const student4 = await prisma.user.create({
    data: {
      firstName: "Daniel",
      lastName: "Musa",
      email: "daniel@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const mentor1 = await prisma.user.create({
    data: {
      firstName: "Femi",
      lastName: "Ogunleye",
      email: "mentor@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.MENTOR,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const mentor2 = await prisma.user.create({
    data: {
      firstName: "Blessing",
      lastName: "Okoro",
      email: "blessing@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.MENTOR,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: "Chioma",
      lastName: "Okonkwo",
      email: "admin@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      firstName: "Damilola",
      lastName: "Ade",
      email: "superadmin@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.SUPER_ADMIN,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
      isActive: true,
      onboardingCompleted: true,
      notificationPreferences: defaultPreferences,
    },
  });

  const mentor = mentor1;

  console.log("👤 Created users (4 Students, 2 Mentors, Admin, Super Admin)");

  // 2. Create Bootcamp
  const bootcamp = await prisma.bootcamp.create({
    data: {
      name: "GDG LASU Bootcamp 2026",
      description: "Premier multi-track engineering bootcamp hosted by Google Developer Group on Campus, Lagos State University.",
      startDate: new Date("2026-02-01T00:00:00.000Z"),
      endDate: new Date("2026-05-30T23:59:59.000Z"),
      isActive: true,
    },
  });

  // 3. Create Cohort 1 & Cohort 2
  const cohort1 = await prisma.cohort.create({
    data: {
      name: "Cohort 1.0 (Alpha)",
      bootcampId: bootcamp.id,
      startDate: new Date("2026-02-01T00:00:00.000Z"),
      endDate: new Date("2026-05-30T23:59:59.000Z"),
      isActive: true,
    },
  });

  const cohort2 = await prisma.cohort.create({
    data: {
      name: "Cohort 2.0 (Beta Preview)",
      bootcampId: bootcamp.id,
      startDate: new Date("2026-07-01T00:00:00.000Z"),
      endDate: new Date("2026-10-30T23:59:59.000Z"),
      isActive: true,
    },
  });

  console.log("🏫 Created Bootcamp & 2 Cohorts");

  // 4. Create Tracks
  const backendTrack = await prisma.track.create({
    data: {
      name: "Backend Development",
      slug: "backend-development",
      description: "Master modern server-side engineering, RESTful APIs, databases, authentication, and cloud deployment with Node.js and TypeScript.",
      accent: "#4285F4", // Google Blue
      cohortId: cohort1.id,
    },
  });

  const frontendTrack = await prisma.track.create({
    data: {
      name: "Frontend Development",
      slug: "frontend-development",
      description: "Build high-performance, accessible, responsive web interfaces using modern React 19, Next.js App Router, and Tailwind CSS.",
      accent: "#0F9D58", // Google Green
      cohortId: cohort1.id,
    },
  });

  const dsaTrack = await prisma.track.create({
    data: {
      name: "DSA & Interview Preparation",
      slug: "dsa-interview-prep",
      description: "Sharpen algorithmic problem-solving skills, data structures, complexity analysis, and tech interview readiness.",
      accent: "#EA4335", // Google Red
      cohortId: cohort1.id,
    },
  });

  console.log("🛣️ Created Tracks (Backend, Frontend, DSA)");

  // 5. Enrollments & Mentor Assignments
  await prisma.enrollment.createMany({
    data: [
      { userId: student1.id, trackId: backendTrack.id, isActive: true },
      { userId: student1.id, trackId: frontendTrack.id, isActive: true },
      { userId: student1.id, trackId: dsaTrack.id, isActive: true },
      { userId: student2.id, trackId: backendTrack.id, isActive: true },
      { userId: student3.id, trackId: backendTrack.id, isActive: true },
      { userId: student4.id, trackId: backendTrack.id, isActive: true },
    ],
  });

  await prisma.mentorAssignment.createMany({
    data: [
      { mentorId: mentor1.id, trackId: backendTrack.id },
      { mentorId: mentor2.id, trackId: frontendTrack.id },
    ],
  });

  console.log("🤝 Created Enrollments and Mentor Assignment for Backend Development");

  // 6. Backend Modules and Lessons
  const module1 = await prisma.module.create({
    data: {
      trackId: backendTrack.id,
      title: "Backend Fundamentals",
      slug: "backend-fundamentals",
      description: "Understand how the server web works, protocols, client-server relationships, and the foundational pillars of backend engineering.",
      order: 1,
    },
  });

  const lesson1_1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "What is Backend Development?",
      slug: "what-is-backend-development",
      description: "An introduction to backend architecture, responsibilities of server-side systems, and the developer ecosystem.",
      content: "Backend development powers the logic, databases, security, and integration behind every modern digital experience...",
      durationMinutes: 45,
      order: 1,
      isPublished: true,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Client-Server Architecture",
      slug: "client-server-architecture",
      description: "Explore request-response lifecycles, network boundaries, DNS resolution, and load balancing principles.",
      content: "In a client-server architecture, client applications initiate requests and servers process and respond with appropriate data...",
      durationMinutes: 50,
      order: 2,
      isPublished: true,
    },
  });

  const lesson1_3 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "HTTP & REST APIs",
      slug: "http-and-rest-apis",
      description: "Master HTTP verbs, status codes, headers, URL structures, and the architectural constraints of REST.",
      content: "HTTP is the foundational communication protocol of the web. Understanding its methods, headers, and status codes is essential...",
      durationMinutes: 60,
      order: 3,
      isPublished: true,
    },
  });

  const module2 = await prisma.module.create({
    data: {
      trackId: backendTrack.id,
      title: "Node.js Fundamentals",
      slug: "nodejs-fundamentals",
      description: "Dive into the V8 engine, asynchronous event-driven I/O, npm package ecosystem, and concurrency in JavaScript.",
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Node.js Architecture & Event Loop",
      slug: "nodejs-architecture-and-event-loop",
      description: "Understand libuv, the call stack, microtask queues, and non-blocking I/O execution.",
      content: "Node.js uses an event-driven, single-threaded model capable of handling high throughput without blocking...",
      durationMinutes: 55,
      order: 1,
      isPublished: true,
    },
  });

  const module3 = await prisma.module.create({
    data: {
      trackId: backendTrack.id,
      title: "Building APIs with Express",
      slug: "building-apis-with-express",
      description: "Create scalable REST APIs, middleware pipelines, route handlers, error wrappers, and input sanitization.",
      order: 3,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Express Router & Middleware Chains",
      slug: "express-router-and-middleware-chains",
      description: "Organize endpoints with modular routers and compose reusable middleware for authentication, logging, and CORS.",
      content: "Middleware functions are functions that have access to the request object, response object, and next middleware function...",
      durationMinutes: 60,
      order: 1,
      isPublished: true,
    },
  });

  console.log("📚 Seeded Modules and Lessons");

  // 7. Seed Resources
  await prisma.resource.createMany({
    data: [
      {
        title: "HTTP Status Codes Cheatsheet",
        description: "Official GDG LASU quick reference for 2xx, 3xx, 4xx, and 5xx HTTP response codes and headers.",
        type: ResourceType.PDF,
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
        uploadedById: mentor.id,
        moduleId: module1.id,
        lessonId: lesson1_3.id,
        isRequired: true,
      },
      {
        title: "Express REST API Starter Kit",
        description: "Template repository with TypeScript, ESLint, Prettier, Express, and Prisma pre-configured.",
        type: ResourceType.GITHUB,
        url: "https://github.com/gdg-lasu/backend-starter-kit",
        uploadedById: mentor.id,
        moduleId: module3.id,
        isRequired: false,
      },
    ],
  });

  console.log("📎 Seeded Resources");

  // 8. Seed Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      trackId: backendTrack.id,
      moduleId: module3.id,
      title: "Build a REST API with Express & Zod",
      description: "Design and implement a complete RESTful API for a digital bookstore featuring CRUD operations, Zod validation, error handling, and Prisma ORM integration.",
      instructions: "1. Fork the starter repository.\n2. Define models in Prisma schema.\n3. Implement endpoints under /api/v1/books.\n4. Validate all request bodies with Zod.\n5. Include an automated Postman collection or automated tests.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 2 weeks
      points: 100,
      type: AssignmentType.PROJECT,
      createdById: mentor.id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      trackId: backendTrack.id,
      moduleId: module1.id,
      title: "Client-Server & HTTP Architecture Quiz",
      description: "A short assessment covering HTTP methods, idempotency, caching headers, and client-server boundaries.",
      instructions: "Answer all 15 multiple-choice questions within the allotted 30 minutes time limit.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 1 week
      points: 25,
      type: AssignmentType.QUIZ,
      createdById: mentor.id,
    },
  });

  console.log("📝 Seeded Assignments");

  // 8b. Seed Submissions across students
  // Student 1: Submitted (Pending Review)
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student1.id,
      githubUrl: "https://github.com/tobi-adebayo/bookstore-api",
      liveUrl: "https://bookstore-api-tobi.railway.app",
      notes: "Implemented complete bookstore API with Prisma, PostgreSQL, and comprehensive Zod validation schemas.",
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  // Student 2: Reviewed with score and feedback
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student2.id,
      githubUrl: "https://github.com/kehinde-balogun/lasu-bookstore-express",
      liveUrl: "https://lasu-bookstore.render.com",
      notes: "Includes Docker compose file and full Swagger OpenAPI documentation.",
      status: SubmissionStatus.REVIEWED,
      score: 95,
      feedback: "Exceptional submission Kehinde! Clean modular architecture, proper error handling middleware, and comprehensive unit tests.",
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 3: Submitted (Pending Review)
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student3.id,
      githubUrl: "https://github.com/amaka-eze/gdg-express-api",
      liveUrl: "https://gdg-express-api.vercel.app",
      notes: "Implemented all CRUD routes with pagination and soft deletes.",
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 4: Draft
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student4.id,
      githubUrl: "https://github.com/daniel-musa/wip-bookstore",
      notes: "Still working on the authentication middleware and Prisma relations.",
      status: SubmissionStatus.DRAFT,
    },
  });

  console.log("📨 Seeded Student Submissions (Pending, Reviewed, Draft)");

  // 9. Seed Sessions (Past & Upcoming)
  // Past session for Attendance
  const pastSessionDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  pastSessionDate.setHours(10, 0, 0, 0);
  const pastSessionEndDate = new Date(pastSessionDate);
  pastSessionEndDate.setHours(12, 0, 0, 0);

  const pastSession = await prisma.session.create({
    data: {
      trackId: backendTrack.id,
      title: "Backend Live Class: Architecture & HTTP Deep Dive",
      description: "Foundational session covering client-server protocol and REST design principles.",
      startTime: pastSessionDate,
      endTime: pastSessionEndDate,
      mode: SessionMode.VIRTUAL,
      meetingUrl: "https://meet.google.com/gdg-lasu-backend",
      recordingUrl: "https://youtube.com/watch?v=sample-gdg-backend-recording",
      mentorId: mentor.id,
    },
  });

  // Seed Attendance for past session
  await prisma.attendance.createMany({
    data: [
      { sessionId: pastSession.id, studentId: student1.id, status: AttendanceStatus.PRESENT, markedById: mentor.id },
      { sessionId: pastSession.id, studentId: student2.id, status: AttendanceStatus.PRESENT, markedById: mentor.id },
      { sessionId: pastSession.id, studentId: student3.id, status: AttendanceStatus.EXCUSED, markedById: mentor.id },
      { sessionId: pastSession.id, studentId: student4.id, status: AttendanceStatus.ABSENT, markedById: mentor.id },
    ],
  });

  // Upcoming sessions
  const nextSaturday = new Date();
  nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));
  nextSaturday.setHours(10, 0, 0, 0);
  const nextSaturdayEnd = new Date(nextSaturday);
  nextSaturdayEnd.setHours(12, 30, 0, 0);

  await prisma.session.create({
    data: {
      trackId: backendTrack.id,
      title: "Backend Live Class: Express & Middleware Deep Dive",
      description: "Interactive live lecture and live coding session exploring custom middleware pipelines and error handlers.",
      startTime: nextSaturday,
      endTime: nextSaturdayEnd,
      mode: SessionMode.VIRTUAL,
      meetingUrl: "https://meet.google.com/gdg-lasu-backend",
      mentorId: mentor.id,
    },
  });

  const afternoonLab = new Date(nextSaturday);
  afternoonLab.setHours(14, 0, 0, 0);
  const afternoonLabEnd = new Date(nextSaturday);
  afternoonLabEnd.setHours(17, 0, 0, 0);

  await prisma.session.create({
    data: {
      trackId: backendTrack.id,
      title: "Cohort 1 In-Person Hands-on Engineering Lab",
      description: "Collaborative physical coding session with mentors for code reviews, debugging, and live feedback.",
      startTime: afternoonLab,
      endTime: afternoonLabEnd,
      mode: SessionMode.PHYSICAL,
      location: "Faculty of Science Computer Lab 4, LASU Ojo Main Campus",
      mentorId: mentor.id,
    },
  });

  console.log("🗓️ Seeded Sessions & Attendance Records");

  // 10. Seed Announcements
  await prisma.announcement.create({
    data: {
      title: "Welcome to GDG LASU Bootcamp 2026!",
      content: "We are thrilled to welcome all selected candidates to Cohort 1 of the GDG LASU Bootcamp 2026! Please ensure you have joined our official Discord server and verified your track enrollment on this platform. Live orientation begins this Saturday at 10:00 AM.",
      priority: AnnouncementPriority.URGENT,
      trackId: null, // General announcement
      authorId: admin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Backend Track Office Hours & Assignment 1 Released",
      content: "The 'Build a REST API with Express & Zod' assignment has been published! Our weekly mentor office hours will take place every Thursday at 7:00 PM via Google Meet. Reach out on Discord if you have any questions.",
      priority: AnnouncementPriority.IMPORTANT,
      trackId: backendTrack.id,
      authorId: mentor.id,
    },
  });

  console.log("📢 Seeded Announcements");

  // 11. Seed sample lesson progress for student
  await prisma.lessonProgress.create({
    data: {
      lessonId: lesson1_1.id,
      studentId: student1.id,
      completed: true,
      completedAt: new Date(),
    },
  });

  // 12. Seed sample In-App Notifications for student1
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: NotificationType.ENROLLMENT_CONFIRMED,
        title: "Enrollment Confirmed!",
        message: "Welcome aboard! You have officially been enrolled in the Backend Engineering track.",
        link: "/",
        eventKey: `enrollment:${student1.id}:seed`,
        readAt: new Date(Date.now() - 86400000 * 2),
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        userId: student1.id,
        type: NotificationType.ANNOUNCEMENT_NEW,
        title: "Welcome to GDG LASU Bootcamp 2026!",
        message: "Orientation begins this Saturday at 10:00 AM. Please verify your track enrollment.",
        link: "/announcements",
        eventKey: `announcement:welcome:${student1.id}`,
        readAt: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        userId: student1.id,
        type: NotificationType.ASSIGNMENT_NEW,
        title: "New Assignment: Build a REST API with Express & Zod",
        message: "A new assignment has been posted for the Backend track — due next Sunday.",
        link: "/assignments",
        eventKey: `assignment-new:asgn-1:${student1.id}`,
        readAt: null, // unread
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        userId: student1.id,
        type: NotificationType.SESSION_NEW,
        title: "Live Session: Node.js Architecture & Express Deep Dive",
        message: "A live virtual session is scheduled for Saturday at 11:00 AM.",
        link: "/schedule",
        eventKey: `session-new:sess-1:${student1.id}`,
        readAt: null, // unread
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        userId: student1.id,
        type: NotificationType.RESOURCE_NEW,
        title: "New Resource: Express & TypeScript Boilerplate",
        message: "A starter GitHub repository has been added to the Backend track resources.",
        link: "/resources",
        eventKey: `resource-new:res-1:${student1.id}`,
        readAt: null, // unread
        createdAt: new Date(Date.now() - 1800000),
      },
    ],
  });

  console.log("🔔 Seeded Notifications");

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
