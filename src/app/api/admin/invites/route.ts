import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInviteSchema } from "@/lib/validations/onboarding";
import { getAdminInvites, createAdminInvite } from "@/lib/data/invites";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get("filter") || "all") as "all" | "active" | "expired" | "inactive";

    const invites = await getAdminInvites(filter);
    return NextResponse.json({ invites });
  } catch (error: any) {
    console.error("Admin invites GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createInviteSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Validation failed";
      return NextResponse.json({ error: firstError, details: fieldErrors }, { status: 400 });
    }

    const invite = await createAdminInvite(parsed.data, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Invite created successfully",
        invite,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin create invite error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating invite" },
      { status: 500 }
    );
  }
}
