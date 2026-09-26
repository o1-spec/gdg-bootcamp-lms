import { PrismaClient, Role, SubmissionStatus, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 8 comprehensive tracks for the GDG LASU Bootcamp
const TRACK_DEFINITIONS = [
  {
    name: "Backend Development",
    slug: "backend-development",
    description: "Master modern server-side engineering, RESTful & GraphQL APIs, relational databases, authentication, and cloud deployment with Node.js and TypeScript.",
    accent: "#4285F4", // Google Blue
  },
  {
    name: "Frontend Development",
    slug: "frontend-development",
    description: "Build high-performance, accessible, responsive web interfaces using modern React 19, Next.js App Router, and Tailwind CSS.",
    accent: "#0F9D58", // Google Green
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    description: "Build cross-platform iOS and Android applications with Flutter, Dart, state management, and Google Firebase integrations.",
    accent: "#EA4335", // Google Red
  },
  {
    name: "Cloud & DevOps Engineering",
    slug: "cloud-devops",
    description: "Design resilient infrastructure using Google Cloud Platform (GCP), Docker containerization, Kubernetes, and CI/CD pipelines.",
    accent: "#FBBC04", // Google Yellow
  },
  {
    name: "UI/UX & Product Design",
    slug: "uiux-design",
    description: "Craft human-centered digital experiences, design systems, interactive prototypes in Figma, and conduct usability research.",
    accent: "#A142F4", // Google Purple
  },
  {
    name: "Machine Learning & AI",
    slug: "ai-machine-learning",
    description: "Explore foundational machine learning, prompt engineering, Gemini API integration, TensorFlow, and Python data science.",
    accent: "#24C1E0", // Google Cyan
  },
  {
    name: "Cybersecurity & AppSec",
    slug: "cybersecurity",
    description: "Understand defensive security, web application vulnerability scanning, OWASP Top 10, penetration testing, and secure coding practices.",
    accent: "#E8710A", // Google Orange
  },
  {
    name: "DSA & Technical Interview Prep",
    slug: "dsa-interview-prep",
    description: "Sharpen algorithmic problem-solving skills, data structures, complexity analysis, and tech interview readiness.",
    accent: "#5F6368", // Google Dark Gray
  },
];

// 16 Mentors (2 dedicated mentors per track)
const MENTORS_DATA = [
  // Backend
  { firstName: "Femi", lastName: "Ogunleye", email: "femi.backend@gdglasu.dev", trackSlug: "backend-development", bio: "Senior Node.js & Distributed Systems Engineer at Paystack." },
  { firstName: "Blessing", lastName: "Okoro", email: "blessing.backend@gdglasu.dev", trackSlug: "backend-development", bio: "Backend Architect specializing in PostgreSQL and high-throughput microservices." },
  // Frontend
  { firstName: "Damilola", lastName: "Adeleke", email: "damilola.frontend@gdglasu.dev", trackSlug: "frontend-development", bio: "Staff Frontend Engineer specializing in Next.js, Web Performance, and Design Systems." },
  { firstName: "Chukwudi", lastName: "Nwachukwu", email: "chukwudi.frontend@gdglasu.dev", trackSlug: "frontend-development", bio: "Frontend Developer & Open Source Contributor to React ecosystem." },
  // Mobile
  { firstName: "Ibrahim", lastName: "Suleiman", email: "ibrahim.mobile@gdglasu.dev", trackSlug: "mobile-development", bio: "Google Developer Expert in Flutter with 6+ years building fintech apps." },
  { firstName: "Yetunde", lastName: "Balogun", email: "yetunde.mobile@gdglasu.dev", trackSlug: "mobile-development", bio: "Lead Mobile Architect specializing in offline-first Flutter and Firebase architecture." },
  // Cloud & DevOps
  { firstName: "Babatunde", lastName: "Ajayi", email: "babatunde.cloud@gdglasu.dev", trackSlug: "cloud-devops", bio: "Cloud Solutions Architect certified in Google Cloud Professional Cloud Architect." },
  { firstName: "Ngozi", lastName: "Eze", email: "ngozi.devops@gdglasu.dev", trackSlug: "cloud-devops", bio: "Site Reliability Engineer driving Kubernetes adoption and automated CI/CD." },
  // UI/UX
  { firstName: "Kemi", lastName: "Adegoke", email: "kemi.uiux@gdglasu.dev", trackSlug: "uiux-design", bio: "Product Design Lead with a passion for accessibility, typography, and design tokens." },
  { firstName: "Tari", lastName: "Doubra", email: "tari.design@gdglasu.dev", trackSlug: "uiux-design", bio: "User Experience Researcher specializing in usability testing and micro-interactions." },
  // AI/ML
  { firstName: "Abubakar", lastName: "Aliyu", email: "abubakar.aiml@gdglasu.dev", trackSlug: "ai-machine-learning", bio: "Machine Learning Researcher working on NLP and Google Gemini integrations." },
  { firstName: "Folake", lastName: "Sanusi", email: "folake.ai@gdglasu.dev", trackSlug: "ai-machine-learning", bio: "Data Scientist passionate about computer vision and applied generative AI." },
  // Cybersecurity
  { firstName: "Emmanuel", lastName: "Okafor", email: "emmanuel.security@gdglasu.dev", trackSlug: "cybersecurity", bio: "Certified Ethical Hacker (CEH) and Application Security Consultant." },
  { firstName: "Zainab", lastName: "Idris", email: "zainab.sec@gdglasu.dev", trackSlug: "cybersecurity", bio: "Security Operations Specialist with expertise in Cloud Security posture management." },
  // DSA
  { firstName: "Olumide", lastName: "Falana", email: "olumide.dsa@gdglasu.dev", trackSlug: "dsa-interview-prep", bio: "Competitive Programmer & FAANG Technical Interview Preparation Coach." },
  { firstName: "Chidinma", lastName: "Osuji", email: "chidinma.algo@gdglasu.dev", trackSlug: "dsa-interview-prep", bio: "Software Engineer passionate about Graph Theory, Dynamic Programming, and System Design." },
];

// 72 Students (9 students per track)
const STUDENT_NAMES = [
  // Backend (9)
  { firstName: "Tobi", lastName: "Adebayo", trackSlug: "backend-development" },
  { firstName: "Kehinde", lastName: "Balogun", trackSlug: "backend-development" },
  { firstName: "Amaka", lastName: "Eze", trackSlug: "backend-development" },
  { firstName: "Daniel", lastName: "Musa", trackSlug: "backend-development" },
  { firstName: "Samuel", lastName: "Adeyemi", trackSlug: "backend-development" },
  { firstName: "Precious", lastName: "Olawale", trackSlug: "backend-development" },
  { firstName: "Oluwaseun", lastName: "Bakare", trackSlug: "backend-development" },
  { firstName: "David", lastName: "Nnadi", trackSlug: "backend-development" },
  { firstName: "Fatima", lastName: "Garba", trackSlug: "backend-development" },

  // Frontend (9)
  { firstName: "Ayomide", lastName: "Bamidele", trackSlug: "frontend-development" },
  { firstName: "Chisom", lastName: "Okoli", trackSlug: "frontend-development" },
  { firstName: "Faruk", lastName: "Bello", trackSlug: "frontend-development" },
  { firstName: "Grace", lastName: "Ajibola", trackSlug: "frontend-development" },
  { firstName: "Hassan", lastName: "Yakubu", trackSlug: "frontend-development" },
  { firstName: "Ifeoma", lastName: "Anayo", trackSlug: "frontend-development" },
  { firstName: "Jide", lastName: "Alabi", trackSlug: "frontend-development" },
  { firstName: "Khadijah", lastName: "Usman", trackSlug: "frontend-development" },
  { firstName: "Lucky", lastName: "Osahon", trackSlug: "frontend-development" },

  // Mobile (9)
  { firstName: "Maryam", lastName: "Danjuma", trackSlug: "mobile-development" },
  { firstName: "Nnamdi", lastName: "Azikiwe", trackSlug: "mobile-development" },
  { firstName: "Omotola", lastName: "Jolayemi", trackSlug: "mobile-development" },
  { firstName: "Peter", lastName: "Odoh", trackSlug: "mobile-development" },
  { firstName: "Qudus", lastName: "Akinremi", trackSlug: "mobile-development" },
  { firstName: "Racheal", lastName: "Oladipo", trackSlug: "mobile-development" },
  { firstName: "Segun", lastName: "Arinze", trackSlug: "mobile-development" },
  { firstName: "Titilayo", lastName: "Badmus", trackSlug: "mobile-development" },
  { firstName: "Uche", lastName: "Ibe", trackSlug: "mobile-development" },

  // Cloud & DevOps (9)
  { firstName: "Victor", lastName: "Okorie", trackSlug: "cloud-devops" },
  { firstName: "Wale", lastName: "Gbadamosi", trackSlug: "cloud-devops" },
  { firstName: "Xavier", lastName: "Opara", trackSlug: "cloud-devops" },
  { firstName: "Yusuf", lastName: "Shehu", trackSlug: "cloud-devops" },
  { firstName: "Zion", lastName: "Etim", trackSlug: "cloud-devops" },
  { firstName: "Adewale", lastName: "King", trackSlug: "cloud-devops" },
  { firstName: "Bisi", lastName: "Lawal", trackSlug: "cloud-devops" },
  { firstName: "Chinedu", lastName: "Ekwueme", trackSlug: "cloud-devops" },
  { firstName: "Doris", lastName: "Akpan", trackSlug: "cloud-devops" },

  // UI/UX (9)
  { firstName: "Ebunoluwa", lastName: "Akinwale", trackSlug: "uiux-design" },
  { firstName: "Fisayo", lastName: "Fosudo", trackSlug: "uiux-design" },
  { firstName: "Gideon", lastName: "Mbadiwe", trackSlug: "uiux-design" },
  { firstName: "Halima", lastName: "Gwarzo", trackSlug: "uiux-design" },
  { firstName: "Ikenna", lastName: "Maduka", trackSlug: "uiux-design" },
  { firstName: "Joy", lastName: "Ogbonna", trackSlug: "uiux-design" },
  { firstName: "Kunle", lastName: "Afonja", trackSlug: "uiux-design" },
  { firstName: "Latifat", lastName: "Sanni", trackSlug: "uiux-design" },
  { firstName: "Michael", lastName: "Ojo", trackSlug: "uiux-design" },

  // AI & ML (9)
  { firstName: "Nafisat", lastName: "Balarabe", trackSlug: "ai-machine-learning" },
  { firstName: "Obinna", lastName: "Chukwu", trackSlug: "ai-machine-learning" },
  { firstName: "Peace", lastName: "Nwachukwu", trackSlug: "ai-machine-learning" },
  { firstName: "Qasim", lastName: "Olatunji", trackSlug: "ai-machine-learning" },
  { firstName: "Rita", lastName: "Eke", trackSlug: "ai-machine-learning" },
  { firstName: "Simi", lastName: "Ogunbiyi", trackSlug: "ai-machine-learning" },
  { firstName: "Tope", lastName: "Aluko", trackSlug: "ai-machine-learning" },
  { firstName: "Uthman", lastName: "Mustapha", trackSlug: "ai-machine-learning" },
  { firstName: "Vivian", lastName: "Nwosu", trackSlug: "ai-machine-learning" },

  // Cybersecurity (9)
  { firstName: "Wasiu", lastName: "Jimoh", trackSlug: "cybersecurity" },
  { firstName: "Yinka", lastName: "Shonibare", trackSlug: "cybersecurity" },
  { firstName: "Zubair", lastName: "Malam", trackSlug: "cybersecurity" },
  { firstName: "Abiodun", lastName: "Osinbajo", trackSlug: "cybersecurity" },
  { firstName: "Bukola", lastName: "Saraki", trackSlug: "cybersecurity" },
  { firstName: "Collins", lastName: "Chime", trackSlug: "cybersecurity" },
  { firstName: "Deborah", lastName: "Kalu", trackSlug: "cybersecurity" },
  { firstName: "Enitan", lastName: "Williams", trackSlug: "cybersecurity" },
  { firstName: "Frank", lastName: "Idoko", trackSlug: "cybersecurity" },

  // DSA (9)
  { firstName: "Godwin", lastName: "Emefiele", trackSlug: "dsa-interview-prep" },
  { firstName: "Habib", lastName: "Mohammed", trackSlug: "dsa-interview-prep" },
  { firstName: "Ibrahim", lastName: "Babangida", trackSlug: "dsa-interview-prep" },
  { firstName: "Juliet", lastName: "Ibrahim", trackSlug: "dsa-interview-prep" },
  { firstName: "Kazeem", lastName: "Balogun", trackSlug: "dsa-interview-prep" },
  { firstName: "Lilian", lastName: "Eze", trackSlug: "dsa-interview-prep" },
  { firstName: "Mubarak", lastName: "Bala", trackSlug: "dsa-interview-prep" },
  { firstName: "Ngozi", lastName: "Okonjo", trackSlug: "dsa-interview-prep" },
  { firstName: "Opeyemi", lastName: "Falana", trackSlug: "dsa-interview-prep" },
];

async function main() {
  console.log("====================================================================");
  console.log("🚀 GDG LASU Bootcamp LMS: Large Cohort Seeder (>12 Mentors, >60 Students)");
  console.log("====================================================================");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const defaultPreferences = {
    assignments: true,
    sessions: true,
    resources: true,
    announcements: true,
    feedback: true,
  };

  // 1. Ensure Active Bootcamp exists
  let bootcamp = await prisma.bootcamp.findFirst({ where: { isActive: true } });
  if (!bootcamp) {
    bootcamp = await prisma.bootcamp.create({
      data: {
        name: "GDG LASU Bootcamp 2026",
        description: "Premier multi-track engineering bootcamp hosted by Google Developer Groups on Campus, Lagos State University.",
        startDate: new Date("2026-02-01T00:00:00.000Z"),
        endDate: new Date("2026-05-30T23:59:59.000Z"),
        isActive: true,
      },
    });
  }

  // 2. Ensure Cohort 1 exists
  let cohort = await prisma.cohort.findFirst({ where: { bootcampId: bootcamp.id } });
  if (!cohort) {
    cohort = await prisma.cohort.create({
      data: {
        name: "Cohort 1.0 (Alpha)",
        bootcampId: bootcamp.id,
        startDate: new Date("2026-02-01T00:00:00.000Z"),
        endDate: new Date("2026-05-30T23:59:59.000Z"),
      },
    });
  }

  // 3. Ensure Tracks exist
  const tracksMap = new Map<string, string>(); // slug -> id
  for (const trackDef of TRACK_DEFINITIONS) {
    let track = await prisma.track.findFirst({ where: { slug: trackDef.slug } });
    if (!track) {
      track = await prisma.track.create({
        data: {
          name: trackDef.name,
          slug: trackDef.slug,
          description: trackDef.description,
          accent: trackDef.accent,
          cohortId: cohort.id,
        },
      });
    }
    tracksMap.set(trackDef.slug, track.id);
  }
  console.log(`✅ Ensured ${tracksMap.size} engineering tracks exist across Cohort 1.0`);

  // 4. Seed 16 Mentors (2 per track)
  console.log(`\n👨‍🏫 Seeding ${MENTORS_DATA.length} Mentors across 8 Tracks...`);
  let mentorsCreated = 0;
  for (const m of MENTORS_DATA) {
    const trackId = tracksMap.get(m.trackSlug);
    if (!trackId) continue;

    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {
        firstName: m.firstName,
        lastName: m.lastName,
        displayName: `${m.firstName} ${m.lastName}`,
        bio: m.bio,
        role: Role.MENTOR,
        isActive: true,
        onboardingCompleted: true,
      },
      create: {
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
        displayName: `${m.firstName} ${m.lastName}`,
        bio: m.bio,
        passwordHash: defaultPasswordHash,
        role: Role.MENTOR,
        isActive: true,
        onboardingCompleted: true,
        notificationPreferences: defaultPreferences,
      },
    });

    // Assign mentor to track
    const existingAssignment = await prisma.mentorAssignment.findFirst({
      where: { mentorId: user.id, trackId },
    });
    if (!existingAssignment) {
      await prisma.mentorAssignment.create({
        data: { mentorId: user.id, trackId },
      });
    }

    mentorsCreated++;
  }
  console.log(`✅ Successfully provisioned ${mentorsCreated} Mentors with track assignments!`);

  // 5. Seed 72 Students (9 per track, strictly 1 track per student)
  console.log(`\n🎓 Seeding ${STUDENT_NAMES.length} Students (strictly 1:1 track enrollment)...`);
  let studentsCreated = 0;
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const s = STUDENT_NAMES[i];
    const trackId = tracksMap.get(s.trackSlug);
    if (!trackId) continue;

    const email = `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}${i + 1}@gdglasu.dev`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName: s.firstName,
        lastName: s.lastName,
        displayName: `${s.firstName} ${s.lastName}`,
        role: Role.STUDENT,
        isActive: true,
        onboardingCompleted: true,
      },
      create: {
        email,
        firstName: s.firstName,
        lastName: s.lastName,
        displayName: `${s.firstName} ${s.lastName}`,
        passwordHash: defaultPasswordHash,
        role: Role.STUDENT,
        isActive: true,
        onboardingCompleted: true,
        notificationPreferences: defaultPreferences,
      },
    });

    // Enforce 1:1 track enrollment
    await prisma.enrollment.deleteMany({ where: { userId: user.id } });
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        trackId,
        isActive: true,
      },
    });

    studentsCreated++;
  }
  console.log(`✅ Successfully enrolled ${studentsCreated} Students into their specialized tracks!`);

  // 6. Generate Batch Invites for each Track (100 uses each)
  console.log(`\n🎟️ Generating Track Invite Codes (100 uses per track)...`);
  const adminUser = (await prisma.user.findFirst({ where: { role: Role.ADMIN } })) || (await prisma.user.findFirst());
  if (!adminUser) {
    throw new Error("No user found to assign createdById for invites");
  }

  for (const trackDef of TRACK_DEFINITIONS) {
    const trackId = tracksMap.get(trackDef.slug);
    if (!trackId) continue;

    const code = `GDG-${trackDef.slug.toUpperCase().slice(0, 4)}-2026`;
    await prisma.invite.upsert({
      where: { code },
      update: {
        maxUses: 100,
        trackId,
        cohortId: cohort.id,
        bootcampId: bootcamp.id,
      },
      create: {
        code,
        maxUses: 100,
        useCount: 0,
        trackId,
        cohortId: cohort.id,
        bootcampId: bootcamp.id,
        createdById: adminUser.id,
        expiresAt: new Date("2026-12-31T23:59:59.000Z"),
      },
    });
    console.log(`   • ${trackDef.name}: Code "${code}" (100 uses)`);
  }

  // Summary counts
  const totalUsers = await prisma.user.count();
  const totalMentors = await prisma.user.count({ where: { role: Role.MENTOR } });
  const totalStudents = await prisma.user.count({ where: { role: Role.STUDENT } });
  const totalEnrollments = await prisma.enrollment.count();

  console.log("\n====================================================================");
  console.log(`🎉 Batch Seeding Complete!`);
  console.log(`   • Total Users in DB: ${totalUsers}`);
  console.log(`   • Total Mentors:     ${totalMentors} (Target: >12 ✅)`);
  console.log(`   • Total Students:    ${totalStudents} (Target: >60 ✅)`);
  console.log(`   • Total Enrollments: ${totalEnrollments}`);
  console.log(`   • Password for all:  password123`);
  console.log("====================================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
