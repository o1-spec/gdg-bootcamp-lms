import { PrismaClient, Role, ResourceType, AssignmentType, SessionMode, AnnouncementPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data in reverse dependency order
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
  await prisma.track.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.bootcamp.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing records");

  // Hash development password
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users
  const student = await prisma.user.create({
    data: {
      firstName: "Tobi",
      lastName: "Adebayo",
      email: "student@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    },
  });

  const mentor = await prisma.user.create({
    data: {
      firstName: "Femi",
      lastName: "Ogunleye",
      email: "mentor@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.MENTOR,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: "Chioma",
      lastName: "Okonkwo",
      email: "admin@gdglasu.dev",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
    },
  });

  console.log("👤 Created users (Student, Mentor, Admin)");

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

  // 3. Create Cohort
  const cohort = await prisma.cohort.create({
    data: {
      name: "Cohort 1",
      bootcampId: bootcamp.id,
      startDate: new Date("2026-02-01T00:00:00.000Z"),
      endDate: new Date("2026-05-30T23:59:59.000Z"),
      isActive: true,
    },
  });

  console.log("🏫 Created Bootcamp & Cohort 1");

  // 4. Create Tracks
  const backendTrack = await prisma.track.create({
    data: {
      name: "Backend Development",
      slug: "backend-development",
      description: "Master modern server-side engineering, RESTful APIs, databases, authentication, and cloud deployment with Node.js and TypeScript.",
      accent: "#4285F4", // Google Blue
      cohortId: cohort.id,
    },
  });

  const frontendTrack = await prisma.track.create({
    data: {
      name: "Frontend Development",
      slug: "frontend-development",
      description: "Build high-performance, accessible, responsive web interfaces using modern React 19, Next.js App Router, and Tailwind CSS.",
      accent: "#0F9D58", // Google Green
      cohortId: cohort.id,
    },
  });

  const dsaTrack = await prisma.track.create({
    data: {
      name: "DSA & Interview Preparation",
      slug: "dsa-interview-prep",
      description: "Sharpen algorithmic problem-solving skills, data structures, complexity analysis, and tech interview readiness.",
      accent: "#EA4335", // Google Red
      cohortId: cohort.id,
    },
  });

  console.log("🛣️ Created Tracks (Backend, Frontend, DSA)");

  // 5. Enrollments & Mentor Assignments
  await prisma.enrollment.createMany({
    data: [
      { userId: student.id, trackId: backendTrack.id, isActive: true },
      { userId: student.id, trackId: frontendTrack.id, isActive: true },
      { userId: student.id, trackId: dsaTrack.id, isActive: true },
    ],
  });

  await prisma.mentorAssignment.create({
    data: {
      mentorId: mentor.id,
      trackId: backendTrack.id,
    },
  });

  console.log("🤝 Created Enrollments and Mentor Assignment");

  // 6. Backend Modules and Lessons
  // Module 1: Backend Fundamentals
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

  // Module 2: Node.js Fundamentals
  const module2 = await prisma.module.create({
    data: {
      trackId: backendTrack.id,
      title: "Node.js Fundamentals",
      slug: "nodejs-fundamentals",
      description: "Dive into the V8 engine, asynchronous event-driven I/O, npm package ecosystem, and concurrency in JavaScript.",
      order: 2,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module2.id,
        title: "Node.js Runtime",
        slug: "nodejs-runtime",
        description: "The anatomy of the Node.js runtime, libuv, V8 engine, and differences between browser and server environments.",
        content: "Node.js is an open-source, cross-platform JavaScript runtime environment executing JS outside the browser...",
        durationMinutes: 40,
        order: 1,
        isPublished: true,
      },
      {
        moduleId: module2.id,
        title: "Modules & Packages",
        slug: "modules-and-packages",
        description: "CommonJS vs ESM, semantic versioning, npm scripts, package-lock mechanics, and clean code imports.",
        content: "Modern Node.js projects support both CommonJS and ECMAScript Modules (ESM). Understanding import patterns...",
        durationMinutes: 45,
        order: 2,
        isPublished: true,
      },
      {
        moduleId: module2.id,
        title: "Async JavaScript",
        slug: "async-javascript",
        description: "Callbacks, Promises, async/await, error boundaries, and race conditions in concurrent operations.",
        content: "Asynchronous programming prevents I/O blocking and enables single-threaded runtimes to handle thousands of connections...",
        durationMinutes: 55,
        order: 3,
        isPublished: true,
      },
      {
        moduleId: module2.id,
        title: "Event Loop",
        slug: "event-loop",
        description: "Phase-by-phase breakdown of timers, pending callbacks, poll phase, check (setImmediate), and microtasks queue.",
        content: "The Event Loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded...",
        durationMinutes: 60,
        order: 4,
        isPublished: true,
      },
    ],
  });

  // Module 3: Building APIs
  const module3 = await prisma.module.create({
    data: {
      trackId: backendTrack.id,
      title: "Building APIs",
      slug: "building-apis",
      description: "Construct production-ready HTTP services using Express, middleware pipelines, schema validation, and defensive error handling.",
      order: 3,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module3.id,
        title: "Express Fundamentals",
        slug: "express-fundamentals",
        description: "Routing, request/response objects, route parameters, query strings, and application configuration.",
        content: "Express is a fast, unopinionated, minimalist web framework for Node.js providing robust routing...",
        durationMinutes: 60,
        order: 1,
        isPublished: true,
      },
      {
        moduleId: module3.id,
        title: "REST API Design",
        slug: "rest-api-design",
        description: "Resource naming conventions, pluralization, HTTP status selection, versioning, and idempotency.",
        content: "Designing predictable, developer-friendly REST APIs starts with identifying clear domain resources...",
        durationMinutes: 50,
        order: 2,
        isPublished: true,
      },
      {
        moduleId: module3.id,
        title: "Middleware",
        slug: "middleware",
        description: "The onion architecture, custom middleware creation, logging, CORS, body parsers, and chaining next().",
        content: "Middleware functions have access to the request object, response object, and the next middleware in the cycle...",
        durationMinutes: 45,
        order: 3,
        isPublished: true,
      },
      {
        moduleId: module3.id,
        title: "Validation",
        slug: "validation",
        description: "Sanitizing user inputs, defensive schema validation with Zod, and clear error response formatting.",
        content: "Never trust user inputs. Schema-based runtime validation with libraries like Zod guarantees payload consistency...",
        durationMinutes: 50,
        order: 4,
        isPublished: true,
      },
      {
        moduleId: module3.id,
        title: "Error Handling",
        slug: "error-handling",
        description: "Centralized error handling middleware, custom HttpError classes, operational vs programmer errors, and safe logs.",
        content: "A robust error handling strategy ensures errors are caught, logged securely, and return clean JSON envelopes...",
        durationMinutes: 45,
        order: 5,
        isPublished: true,
      },
    ],
  });

  console.log("📚 Seeded Modules and Lessons for Backend Development");

  // 7. Seed Resources
  await prisma.resource.createMany({
    data: [
      {
        title: "HTTP Status Codes Cheatsheet",
        description: "Visual quick reference guide for all standard HTTP 1.1 / 2.0 response status codes and when to use them.",
        type: ResourceType.CHEATSHEET,
        url: "https://httpstatuses.com",
        uploadedById: mentor.id,
        moduleId: module1.id,
        lessonId: lesson1_3.id,
        isRequired: true,
      },
      {
        title: "Express.js Official Guide",
        description: "Comprehensive guide to Express.js routing, middleware, templates, and database integrations.",
        type: ResourceType.DOCUMENT,
        url: "https://expressjs.com/en/guide/routing.html",
        uploadedById: mentor.id,
        moduleId: module3.id,
        isRequired: true,
      },
      {
        title: "Node.js Event Loop Deep Dive",
        description: "Official guide on timers, process.nextTick(), microtask queues, and libuv internals.",
        type: ResourceType.ARTICLE,
        url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick",
        uploadedById: mentor.id,
        moduleId: module2.id,
        isRequired: false,
      },
      {
        title: "Backend Development Starter Repository",
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
  await prisma.assignment.create({
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

  await prisma.assignment.create({
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

  // 9. Seed Sessions (Schedule)
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

  console.log("🗓️ Seeded Live Sessions");

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
      studentId: student.id,
      completed: true,
      completedAt: new Date(),
    },
  });

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
