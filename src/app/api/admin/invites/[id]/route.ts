import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleInviteStatus, deleteInviteRecord } from "@/lib/data/invites";
import { Role } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const isActive = Boolean(body.isActive);

    const success = await toggleInviteStatus(id, isActive);
    if (!success) {
      return NextResponse.json({ error: "Failed to update invite status" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Invite marked as ${isActive ? "active" : "inactive"}` });
  } catch (error: any) {
    console.error("Invite PATCH error:", error);
    return NextResponse.json({ error: "Failed to update invite" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const success = await deleteInviteRecord(id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete invite" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Invite deleted successfully" });
  } catch (error: any) {
    console.error("Invite DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
  }
}
