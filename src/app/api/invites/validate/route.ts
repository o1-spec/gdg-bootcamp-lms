import { NextRequest, NextResponse } from "next/server";
import { validateInviteCode } from "@/lib/data/invites";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || "";

    if (!code.trim()) {
      return NextResponse.json(
        { valid: false, error: "Invite code is required." },
        { status: 400 }
      );
    }

    const result = await validateInviteCode(code);

    if (!result.valid) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Invite validation error:", error);
    return NextResponse.json(
      { valid: false, error: "An unexpected error occurred while validating the invite code." },
      { status: 500 }
    );
  }
}
