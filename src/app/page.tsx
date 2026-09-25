import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Layers,
  Palette,
  Cpu,
  Smartphone,
  Cloud,
  BookOpen,
  Users,
  CheckCircle2,
  Award,
  Calendar,
  FileCheck,
  FolderGit2,
  TrendingUp,
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

const OFFERINGS = [
  {
    title: "Curated Learning Tracks",
    description:
      "Structured syllabi built by industry engineers that progress from core fundamentals to production-ready patterns.",
    icon: Layers,
    color: "#4285F4",
  },
  {
    title: "Mentor-Led Sessions",
    description:
      "Attend weekly interactive coding workshops and ask questions in real-time with experienced student mentors.",
    icon: Users,
    color: "#EA4335",
  },
  {
    title: "Hands-On Assignments",
    description:
      "Build real-world projects, submit GitHub repositories, and receive detailed reviews with actionable code feedback.",
    icon: FileCheck,
    color: "#34A853",
  },
  {
    title: "Centralized Resource Library",
    description:
      "Instant access to curated slides, starter templates, official docs, and practice datasets.",
    icon: FolderGit2,
    color: "#FBBC04",
  },
  {
    title: "Live Progress Analytics",
    description:
      "Track lesson completions, attendance records, submission grades, and graduation milestones on your dashboard.",
    icon: TrendingUp,
    color: "#4285F4",
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
      take: 8,
    });

    if (dbTracks && dbTracks.length > 0) {
      tracks = dbTracks.map((t, idx) => {
        const fallback = DEFAULT_TRACKS[idx % DEFAULT_TRACKS.length];
        return {
          name: t.name,
          slug: t.slug,
          description: t.description || fallback.description,
          tech: fallback.tech,
          icon: fallback.icon,
          color: t.accent || fallback.color,
        };
      });
    }
  } catch {
    // If DB is offline or not migrated yet, use DEFAULT_TRACKS
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
    <div className="min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30 flex flex-col">
      {/* ── TOP NAVIGATION ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-gdg-border bg-gdg-cream/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gdg-black text-white shadow-sm border border-gdg-dark-border group-hover:scale-105 transition-transform">
              <div className="flex flex-wrap w-5 h-5 gap-1 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-gdg-red" />
                <span className="h-2 w-2 rounded-full bg-gdg-blue" />
                <span className="h-2 w-2 rounded-full bg-gdg-green" />
                <span className="h-2 w-2 rounded-full bg-gdg-yellow" />
              </div>
            </div>
            <div>
              <span className="text-xs font-black tracking-wider uppercase text-gdg-black block">
                GDG ON CAMPUS LASU
              </span>
              <span className="text-[10px] font-bold tracking-wider text-gdg-gray uppercase block">
                Bootcamp LMS 2026
              </span>
            </div>
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-gdg-gray">
            <a href="#offerings" className="hover:text-gdg-black transition-colors">
              Features
            </a>
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
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gdg-black hover:bg-gdg-dark-hover text-xs font-black text-gdg-cream transition-all shadow-sm"
              >
                <span>{dashboardLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gdg-yellow" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 rounded-full text-xs font-bold text-gdg-black hover:bg-gdg-border transition-colors text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/join"
                  className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gdg-blue hover:bg-gdg-blue-dark text-xs font-bold text-white transition-all shadow-sm"
                >
                  <span>Join Bootcamp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO SECTION ────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-gdg-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gdg-border shadow-2xs text-[11px] font-bold text-gdg-black">
                <span className="flex h-2 w-2 rounded-full bg-gdg-green animate-pulse" />
                <span>GDG on Campus • Lagos State University</span>
                <span className="text-gdg-gray/40">•</span>
                <span className="text-gdg-blue font-bold">2026 Cohort</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl font-black text-gdg-black tracking-tight leading-[1.08]">
                Build. Learn. <span className="text-gdg-blue">Ship.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-gdg-gray font-medium leading-relaxed max-w-2xl mx-auto">
                A practical, project-based learning platform for GDG LASU bootcamp students, mentors,
                and organizers. Master high-demand skills, build real software, and launch your career.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
                <Link
                  href="/join"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gdg-black hover:bg-gdg-dark-hover text-sm font-black text-gdg-cream transition-all shadow-md group cursor-pointer"
                >
                  <span>Join with Invite Code</span>
                  <ArrowRight className="w-4 h-4 text-gdg-yellow transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-gdg-border/60 border border-gdg-border text-sm font-bold text-gdg-black transition-all cursor-pointer shadow-2xs"
                >
                  <span>Sign In to Platform</span>
                </Link>
              </div>

              {/* Quick Spec Pills */}
              <div className="pt-8 sm:pt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto text-left">
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
          </div>
        </section>

        {/* ── WHAT THE BOOTCAMP OFFERS ───────────────────────── */}
        <section id="offerings" className="py-16 sm:py-24 border-b border-gdg-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-gdg-blue">
                Platform Capabilities
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-gdg-black tracking-tight">
                Everything You Need to Succeed
              </h2>
              <p className="text-xs sm:text-sm text-gdg-gray font-medium leading-relaxed">
                Purpose-built tools designed to keep students motivated, mentors organized, and administrators in control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {OFFERINGS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-gdg-cream/40 border border-gdg-border hover:border-gdg-black/30 transition-all space-y-4 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                        style={{
                          backgroundColor: `${item.color}15`,
                          borderColor: `${item.color}30`,
                          color: item.color,
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-black text-gdg-black tracking-tight">{item.title}</h3>
                      <p className="text-xs text-gdg-gray font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: item.color }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Included in Bootcamp</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── AVAILABLE TRACKS ───────────────────────────────── */}
        <section id="tracks" className="py-16 sm:py-24 border-b border-gdg-border bg-gdg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-gdg-green">
                Curriculum Tracks
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-gdg-black tracking-tight">
                Specialized Learning Paths
              </h2>
              <p className="text-xs sm:text-sm text-gdg-gray font-medium leading-relaxed">
                Choose the technical path that matches your ambitions. Each track features structured weekly modules and capstone projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track, idx) => {
                const Icon = track.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-white border border-gdg-border hover:border-gdg-black/30 transition-all space-y-5 shadow-2xs flex flex-col justify-between"
                    style={{ borderTop: `4px solid ${track.color}` }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center border"
                          style={{
                            backgroundColor: `${track.color}15`,
                            borderColor: `${track.color}30`,
                            color: track.color,
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-gdg-cream border border-gdg-border text-gdg-black">
                          Track #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-gdg-black tracking-tight">{track.name}</h3>
                        <p className="text-xs text-gdg-gray font-medium leading-relaxed mt-1">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gdg-border/60">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                        Core Technologies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {track.tech.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gdg-cream text-gdg-black border border-gdg-border"
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
        <section id="how-it-works" className="py-16 sm:py-24 border-b border-gdg-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-gdg-yellow">
                Student Journey
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-gdg-black tracking-tight">
                How the Bootcamp Works
              </h2>
              <p className="text-xs sm:text-sm text-gdg-gray font-medium leading-relaxed">
                From initial invite redemption to final project graduation in five clear steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {HOW_IT_WORKS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-gdg-cream/50 border border-gdg-border space-y-3 relative flex flex-col justify-between"
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
        <section id="details" className="py-16 sm:py-20 border-b border-gdg-border bg-gdg-cream">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-white border border-gdg-border shadow-sm space-y-8">
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
        <section className="py-16 sm:py-24 bg-gdg-black text-gdg-cream">
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
      <footer className="border-t border-gdg-border bg-gdg-cream py-8 text-xs text-gdg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gdg-black">GDG on Campus LASU</span>
            <span>•</span>
            <span>Bootcamp LMS © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 font-bold text-gdg-gray">
            <Link href="/join" className="hover:text-gdg-black transition-colors">
              Join
            </Link>
            <Link href="/login" className="hover:text-gdg-black transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-gdg-black transition-colors">
              Student Dashboard
            </Link>
            <Link href="/mentor" className="hover:text-gdg-black transition-colors">
              Mentor Portal
            </Link>
            <Link href="/admin" className="hover:text-gdg-black transition-colors">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
