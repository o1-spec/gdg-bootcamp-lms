import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { validateInviteCode } from "@/lib/data/invites";
import { Ticket, ArrowRight, UserPlus, LogIn, Award, Sparkles } from "lucide-react";

export const metadata = {
  title: "Join GDG LASU Bootcamp | Welcome",
  description: "You've been invited to join the GDG on Campus LASU Bootcamp.",
};

export default async function PublicJoinPage(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await props.searchParams;
  const cleanCode = (code || "").trim().toUpperCase();

  // If user is already authenticated, send them to onboarding directly with code preserved
  const user = await getCurrentUser();
  if (user) {
    if (!user.firstName || !user.lastName) {
      redirect(`/onboarding/profile${cleanCode ? `?code=${encodeURIComponent(cleanCode)}` : ""}`);
    } else {
      redirect(`/onboarding/join${cleanCode ? `?code=${encodeURIComponent(cleanCode)}` : ""}`);
    }
  }

  // Pre-validate code preview if supplied
  let inviteDetails = null;
  if (cleanCode) {
    const val = await validateInviteCode(cleanCode);
    if (val.valid && val.invite) {
      inviteDetails = val.invite;
    }
  }

  const registerHref = cleanCode ? `/register?code=${encodeURIComponent(cleanCode)}` : "/register";
  const loginHref = cleanCode ? `/login?code=${encodeURIComponent(cleanCode)}` : "/login";

  return (
    <div className="min-h-screen bg-gdg-cream text-gdg-black flex flex-col justify-center items-center py-12 px-4 sm:px-6 selection:bg-gdg-yellow/30">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Brand */}
        <div className="flex justify-center">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <Image
              src="/GDGOC-LASU-logo.webp"
              alt="GDG on Campus LASU Logo"
              width={260}
              height={50}
              priority
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-10 shadow-sm space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gdg-yellow/20 border border-gdg-yellow/40 text-xs font-black text-gdg-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gdg-red" />
              <span>Official Invitation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight">
              You&apos;ve been invited
            </h1>
            <p className="text-xs sm:text-sm text-gdg-gray">
              Join the Google Developer Groups on Campus LASU Bootcamp.
            </p>
          </div>

          {/* Invite Preview Badge if code present */}
          {cleanCode && (
            <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-gdg-gray">
                  Invite Code
                </span>
                <span className="font-mono text-xs font-black text-gdg-black px-2 py-0.5 rounded bg-white border border-gdg-border">
                  {cleanCode}
                </span>
              </div>

              {inviteDetails && (
                <div className="space-y-1 pt-1 border-t border-gdg-border">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gdg-gray">
                    <Award className="w-3.5 h-3.5 text-gdg-yellow" />
                    <span>{inviteDetails.bootcampName}</span>
                  </div>
                  <h4 className="text-sm font-black text-gdg-black">
                    {inviteDetails.trackName || "Bootcamp Cohort Track"}
                  </h4>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href={registerHref}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-gdg-black hover:bg-gdg-dark-border text-xs font-black text-gdg-cream shadow-sm transition-all group"
            >
              <UserPlus className="w-4 h-4 text-gdg-yellow" />
              <span>Create an Account</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={loginHref}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-gdg-cream hover:bg-gdg-border border border-gdg-border text-xs font-bold text-gdg-black transition-all"
            >
              <LogIn className="w-4 h-4 text-gdg-blue" />
              <span>Log In to Existing Account</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-gdg-gray">
          GDG on Campus Lagos State University · Knowledge & Skills Platform
        </p>
      </div>
    </div>
  );
}
