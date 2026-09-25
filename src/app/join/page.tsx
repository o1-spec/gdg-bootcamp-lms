import React from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#FAF7EE] text-[#0D0E11] flex flex-col justify-center items-center py-12 px-4 sm:px-6 selection:bg-[#FBBC04]/30">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Brand */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#EA4335] via-[#4285F4] to-[#34A853] p-[2px] shadow-lg">
            <div className="w-full h-full bg-[#0D0E11] rounded-[22px] flex items-center justify-center">
              <span className="font-black text-xl text-[#FAF7EE]">G</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-10 shadow-sm space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBC04]/20 border border-[#FBBC04]/40 text-xs font-black text-[#0D0E11] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#EA4335]" />
              <span>Official Invitation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight">
              You&apos;ve been invited
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368]">
              Join the Google Developer Groups on Campus LASU Bootcamp.
            </p>
          </div>

          {/* Invite Preview Badge if code present */}
          {cleanCode && (
            <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#5F6368]">
                  Invite Code
                </span>
                <span className="font-mono text-xs font-black text-[#0D0E11] px-2 py-0.5 rounded bg-white border border-[#E5DFD0]">
                  {cleanCode}
                </span>
              </div>

              {inviteDetails && (
                <div className="space-y-1 pt-1 border-t border-[#E5DFD0]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5F6368]">
                    <Award className="w-3.5 h-3.5 text-[#FBBC04]" />
                    <span>{inviteDetails.bootcampName}</span>
                  </div>
                  <h4 className="text-sm font-black text-[#0D0E11]">
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
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#0D0E11] hover:bg-[#22242B] text-xs font-black text-[#FAF7EE] shadow-sm transition-all group"
            >
              <UserPlus className="w-4 h-4 text-[#FBBC04]" />
              <span>Create an Account</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={loginHref}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#FAF7EE] hover:bg-[#E5DFD0] border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] transition-all"
            >
              <LogIn className="w-4 h-4 text-[#4285F4]" />
              <span>Log In to Existing Account</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-[#5F6368]">
          GDG on Campus Lagos State University · Knowledge & Skills Platform
        </p>
      </div>
    </div>
  );
}
