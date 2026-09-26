import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Palette,
  Cpu,
  Smartphone,
  Cloud,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export const metadata = {
  title: "GDG LASU Bootcamp | Build. Learn. Ship.",
  description:
    "A practical, project-based learning platform for GDG on Campus LASU bootcamp students, mentors, and organizers.",
};

const DEFAULT_TRACKS = [
  {
    name: "Backend Development",
    slug: "backend",
    description: "Design robust APIs, microservices, databases, and scalable server architecture.",
    tech: ["Node.js", "Express", "PostgreSQL", "Prisma", "REST & GraphQL"],
    icon: Terminal,
    color: "#EA4335",
  },
  {
    name: "Frontend Development",
    slug: "frontend",
    description: "Craft responsive, interactive, accessible user interfaces for modern web applications.",
    tech: ["React 19", "Next.js", "TypeScript", "Tailwind CSS"],
    icon: Code2,
    color: "#4285F4",
  },
  {
    name: "DSA & Interview Prep",
    slug: "dsa",
    description: "Master algorithms, data structures, and problem-solving patterns for technical interviews.",
    tech: ["Arrays & Graphs", "Dynamic Programming", "LeetCode", "System Design"],
    icon: Cpu,
    color: "#34A853",
  },
  {
    name: "UI/UX & Product Design",
    slug: "ui-ux",
    description: "Create user-centered digital experiences, wireframes, design systems, and prototypes.",
    tech: ["Figma", "Design Systems", "User Research", "Prototyping"],
    icon: Palette,
    color: "#FBBC04",
  },
  {
    name: "Data Science & AI",
    slug: "data-ai",
    description: "Analyze datasets, build machine learning models, and leverage modern generative AI APIs.",
    tech: ["Python", "Pandas", "Scikit-Learn", "Gemini & LLMs"],
    icon: Sparkles,
    color: "#4285F4",
  },
  {
    name: "Mobile App Development",
    slug: "mobile",
    description: "Build performant native and cross-platform mobile apps for iOS and Android.",
    tech: ["Flutter", "Dart", "React Native", "Firebase"],
    icon: Smartphone,
    color: "#34A853",
  },
  {
    name: "Cloud & DevOps",
    slug: "cloud-devops",
    description: "Automate CI/CD pipelines, containerize applications, and deploy cloud infrastructure.",
    tech: ["Docker", "GitHub Actions", "Google Cloud", "Vercel"],
    icon: Cloud,
    color: "#EA4335",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Join Your Track",
    description: "Redeem your bootcamp invite code, set up your profile, and select your learning track.",
  },
  {
    step: "02",
    title: "Access Lessons & Resources",
    description: "Follow weekly module roadmaps, explore code guides, and access curated slides and videos.",
  },
  {
    step: "03",
    title: "Attend Live Sessions",
    description: "Participate in physical workshops on campus and virtual live coding reviews.",
  },
  {
    step: "04",
    title: "Complete Assignments",
    description: "Build portfolio-ready projects, submit code repositories, and receive mentor grading.",
  },
  {
    step: "05",
    title: "Track & Graduate",
    description: "Monitor your completion metrics, maintain attendance, and earn your bootcamp graduation status.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  // Fetch published tracks from database with fallback
  let tracks = DEFAULT_TRACKS;
  try {
    const dbTracks = await prisma.track.findMany({
      include: {
        modules: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 12,
    });

    if (dbTracks && dbTracks.length > 0) {
      tracks = dbTracks.map((t, idx) => {
        const matchingDefault =
          DEFAULT_TRACKS.find(
            (dt) =>
              dt.name.toLowerCase() === t.name.toLowerCase() ||
              t.slug.includes(dt.slug) ||
              dt.slug.includes(t.slug)
          ) || DEFAULT_TRACKS[idx % DEFAULT_TRACKS.length];

        return {
          name: t.name,
          slug: t.slug,
          description: t.description || matchingDefault.description,
          tech: matchingDefault.tech,
          icon: matchingDefault.icon,
          color: t.accent || matchingDefault.color,
        };
      });
    }
  } catch {
    // If DB is offline, fall back to DEFAULT_TRACKS
  }

  // Determine user dashboard link
  let dashboardHref = "/login";
  let dashboardLabel = "Sign In";
  if (user) {
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      dashboardHref = "/admin/dashboard";
      dashboardLabel = "Admin Console";
    } else if (user.role === "MENTOR") {
      dashboardHref = "/mentor/dashboard";
      dashboardLabel = "Mentor Console";
    } else {
      dashboardHref = "/dashboard";
      dashboardLabel = "Go to Dashboard";
    }
  }

  return (
    <div className="min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30 flex flex-col w-full overflow-x-hidden">
      {/* ── TOP NAVIGATION ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-gdg-border/60 bg-gdg-cream/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Official GDG on Campus Logo & Brand */}
          <Link href="/" className="flex items-center group shrink-0 transition-transform hover:scale-[1.02]">
            <Image
              src="/GDGOC-LASU-logo.webp"
              alt="Google Developer Groups on Campus Lagos State University"
              width={260}
              height={50}
              priority
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gdg-gray">
            <Link href="/" className="text-gdg-black font-extrabold hover:text-gdg-black transition-colors">
              Home
            </Link>
            <a href="#tracks" className="hover:text-gdg-black transition-colors">
              Tracks
            </a>
            <a href="#how-it-works" className="hover:text-gdg-black transition-colors">
              How It Works
            </a>
            <a href="#details" className="hover:text-gdg-black transition-colors">
              Bootcamp Details
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gdg-black hover:bg-gdg-dark-hover text-xs font-black text-gdg-cream transition-all shadow-sm"
              >
                <span>{dashboardLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gdg-yellow" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 rounded-full text-xs font-bold text-gdg-black hover:bg-gdg-border/60 transition-colors text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/join"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gdg-black hover:bg-gdg-dark-hover text-xs font-bold text-white transition-all shadow-sm"
                >
                  <span>Join Us</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gdg-yellow" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── FULL SCREEN HERO SECTION (Fills screen completely before scroll) ── */}
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 sm:py-16 border-b border-gdg-border/60 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-6 sm:space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gdg-border shadow-2xs text-[11px] font-bold text-gdg-black mx-auto">
              <span className="flex h-2 w-2 rounded-full bg-gdg-green animate-pulse" />
              <span>GDG on Campus • Lagos State University</span>
              <span className="text-gdg-gray/40">•</span>
              <span className="text-gdg-blue font-bold">2026 Cohort</span>
            </div>

            {/* Massive Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gdg-black tracking-tight leading-[1.08] max-w-4xl mx-auto">
              Your tech journey <br className="hidden sm:inline" />
              starts <span className="text-gdg-blue">here.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-gdg-gray font-medium leading-relaxed max-w-2xl mx-auto">
              Connect with developers, designers, and innovators shaping the future of technology at
              Lagos State University. Learn in-demand skills, build impactful products with Google
              technologies, and grow together.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <a
                href="#tracks"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gdg-black hover:bg-gdg-dark-hover text-sm font-black text-gdg-cream transition-all shadow-md group cursor-pointer"
              >
                <span>Explore Learning Tracks</span>
                <ArrowRight className="w-4 h-4 text-gdg-yellow transition-transform group-hover:translate-x-1" />
              </a>

              <Link
                href="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-gdg-border/50 border border-gdg-border text-sm font-bold text-gdg-black transition-all cursor-pointer shadow-2xs"
              >
                <span>Bootcamp Registration</span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-gdg-border/60 max-w-md mx-auto">
              <div className="flex items-center -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-gdg-blue border-2 border-gdg-cream shadow-xs" />
                <span className="w-6 h-6 rounded-full bg-gdg-red border-2 border-gdg-cream shadow-xs" />
                <span className="w-6 h-6 rounded-full bg-gdg-yellow border-2 border-gdg-cream shadow-xs" />
                <span className="w-6 h-6 rounded-full bg-gdg-green border-2 border-gdg-cream shadow-xs" />
                <span className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-gdg-cream shadow-xs" />
              </div>
              <p className="text-xs text-gdg-gray font-semibold">
                <strong className="text-gdg-black font-black">500+ student innovators</strong> already learning & building
              </p>
            </div>

            {/* Quick Spec Pills */}
            <div className="pt-4 sm:pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-white border border-gdg-border shadow-2xs">
                <div className="text-[10px] font-black uppercase text-gdg-gray tracking-wider">Duration</div>
                <div className="text-lg font-black text-gdg-black mt-0.5">6 Weeks</div>
                <div className="text-[11px] text-gdg-gray font-medium">Intensive curriculum</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gdg-border shadow-2xs">
                <div className="text-[10px] font-black uppercase text-gdg-gray tracking-wider">Curriculum</div>
                <div className="text-lg font-black text-gdg-blue mt-0.5">7 Tracks</div>
                <div className="text-[11px] text-gdg-gray font-medium">Specialized paths</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gdg-border shadow-2xs">
                <div className="text-[10px] font-black uppercase text-gdg-gray tracking-wider">Mentorship</div>
                <div className="text-lg font-black text-gdg-green mt-0.5">1-on-1 & Live</div>
                <div className="text-[11px] text-gdg-gray font-medium">Weekly code reviews</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gdg-border shadow-2xs">
                <div className="text-[10px] font-black uppercase text-gdg-gray tracking-wider">Format</div>
                <div className="text-lg font-black text-gdg-yellow mt-0.5">Hybrid</div>
                <div className="text-[11px] text-gdg-gray font-medium">Campus + Google Meet</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AVAILABLE TRACKS ───────────────────────────────── */}
        <section id="tracks" className="py-20 sm:py-28 border-b border-gdg-border/60 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-gdg-green">
                Curriculum Tracks
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-gdg-black tracking-tight">
                Specialized Learning Paths
              </h2>
              <p className="text-xs sm:text-sm text-gdg-gray font-medium leading-relaxed">
                Choose the technical path that matches your ambitions. Each track features structured weekly modules, practical assignments, and code reviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-8 max-w-6xl mx-auto">
              {tracks.map((track, idx) => {
                const Icon = track.icon;
                const isLastSingle = idx === 6;
                return (
                  <div
                    key={idx}
                    className={`p-6 sm:p-7 rounded-3xl bg-gdg-cream/40 border border-gdg-border hover:border-gdg-black/30 transition-all duration-200 hover:shadow-md hover:-translate-y-1 space-y-5 shadow-2xs flex flex-col justify-between ${
                      isLastSingle
                        ? "md:col-span-2 md:max-w-lg md:mx-auto lg:col-span-1 lg:col-start-2 lg:max-w-none lg:w-full"
                        : ""
                    }`}
                    style={{ borderTop: `4px solid ${track.color}` }}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs"
                          style={{
                            backgroundColor: `${track.color}15`,
                            borderColor: `${track.color}30`,
                            color: track.color,
                          }}
                        >
                          <Icon className="w-5.5 h-5.5" />
                        </div>
                        <span className="text-[11px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-white border border-gdg-border text-gdg-black shadow-2xs">
                          Track #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-gdg-black tracking-tight">{track.name}</h3>
                        <p className="text-xs sm:text-[13px] text-gdg-gray font-medium leading-relaxed mt-1.5">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3.5 border-t border-gdg-border/70">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gdg-gray">
                        Core Technologies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {track.tech.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white text-gdg-black border border-gdg-border shadow-2xs"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        <section id="how-it-works" className="py-20 sm:py-28 border-b border-gdg-border/60 bg-gdg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-gdg-yellow">
                Student Journey
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-gdg-black tracking-tight">
                How the Bootcamp Works
              </h2>
              <p className="text-xs sm:text-sm text-gdg-gray font-medium leading-relaxed">
                From initial invite redemption to final project graduation in five clear steps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {HOW_IT_WORKS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-white border border-gdg-border space-y-3 relative flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-3">
                    <span className="text-2xl font-black font-mono text-gdg-blue/30 block">
                      {step.step}
                    </span>
                    <h3 className="text-sm font-black text-gdg-black tracking-tight">{step.title}</h3>
                    <p className="text-xs text-gdg-gray font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-4 h-4 text-gdg-gray/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOOTCAMP DETAILS ───────────────────────────────── */}
        <section id="details" className="py-20 sm:py-24 border-b border-gdg-border/60 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-gdg-cream/40 border border-gdg-border shadow-xs space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gdg-border pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gdg-blue">
                    Program Overview
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                    GDG LASU Bootcamp 2026 Details
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gdg-green/10 text-gdg-green border border-gdg-green/20 text-xs font-bold shrink-0 self-start sm:self-auto">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admissions Open via Invite</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-gdg-gray uppercase tracking-wider text-[10px]">
                    Eligibility
                  </div>
                  <div className="font-bold text-gdg-black text-sm">
                    LASU Students & GDG Community Members
                  </div>
                  <p className="text-gdg-gray leading-relaxed">
                    Open to all undergraduates with a valid invite code from track leads or organizers.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-gdg-gray uppercase tracking-wider text-[10px]">
                    Delivery Mode
                  </div>
                  <div className="font-bold text-gdg-black text-sm">
                    Hybrid (In-Person + Remote)
                  </div>
                  <p className="text-gdg-gray leading-relaxed">
                    Physical coding workshops at Lagos State University coupled with virtual Google Meet sessions.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-gdg-gray uppercase tracking-wider text-[10px]">
                    Weekly Commitment
                  </div>
                  <div className="font-bold text-gdg-black text-sm">
                    6 - 8 Hours / Week
                  </div>
                  <p className="text-gdg-gray leading-relaxed">
                    Includes weekend live sessions, self-paced curriculum exercises, and project building.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-gdg-gray uppercase tracking-wider text-[10px]">
                    Graduation Requirements
                  </div>
                  <div className="font-bold text-gdg-black text-sm">
                    75% Attendance & Completed Projects
                  </div>
                  <p className="text-gdg-gray leading-relaxed">
                    Students who pass technical benchmarks receive official certificates of completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION ─────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-gdg-black text-gdg-cream">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="h-2 w-2 rounded-full bg-gdg-red" />
              <span className="h-2 w-2 rounded-full bg-gdg-blue" />
              <span className="h-2 w-2 rounded-full bg-gdg-green" />
              <span className="h-2 w-2 rounded-full bg-gdg-yellow" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Level Up Your Engineering Career?
            </h2>

            <p className="text-xs sm:text-sm text-gdg-cream/70 font-medium max-w-xl mx-auto leading-relaxed">
              Join your peers in building tangible, production-ready software. Redeem your invite code to begin your learning journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gdg-yellow text-gdg-black hover:bg-gdg-yellow-dark text-sm font-black transition-all shadow-md group cursor-pointer"
              >
                <span>Join with Invite Code</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gdg-dark-border hover:bg-white/10 text-sm font-bold text-white transition-all cursor-pointer border border-white/10"
              >
                <span>Sign In to Your Account</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-gdg-border/60 bg-gdg-cream py-8 sm:py-10 text-xs text-gdg-gray w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Image
              src="/GDGOC-LASU-logo.webp"
              alt="GDG on Campus LASU"
              width={160}
              height={31}
              className="h-7 w-auto object-contain opacity-90"
            />
            <span className="text-gdg-gray/40">•</span>
            <span>Bootcamp LMS © {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-bold text-gdg-gray">
            <Link href="/join" className="hover:text-gdg-black transition-colors whitespace-nowrap">
              Join
            </Link>
            <Link href="/login" className="hover:text-gdg-black transition-colors whitespace-nowrap">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-gdg-black transition-colors whitespace-nowrap">
              Student Dashboard
            </Link>
            <Link href="/mentor" className="hover:text-gdg-black transition-colors whitespace-nowrap">
              Mentor Portal
            </Link>
            <Link href="/admin" className="hover:text-gdg-black transition-colors whitespace-nowrap">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
