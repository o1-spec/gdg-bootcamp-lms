import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { joinBootcampSchema } from "@/lib/validations/onboarding";
import { processEnrollmentWithInvite } from "@/lib/data/invites";
import { createNotification } from "@/lib/data/notifications";
import { NotificationType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in or create an account to join." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = joinBootcampSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid invite payload";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { code, trackIds } = parsed.data;

    const result = await processEnrollmentWithInvite(user.id, code, trackIds);

    if (!result.success) {
      if (result.alreadyEnrolled) {
        return NextResponse.json(
          { error: result.error || "You're already enrolled in this track." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: result.error || "Failed to join bootcamp with this invite." },
        { status: 400 }
      );
    }

    // In-app notification for enrollment confirmation
    await createNotification({
      userId: user.id,
      type: NotificationType.ENROLLMENT_CONFIRMED,
      title: "Enrollment Confirmed!",
      message: `Welcome aboard! You have officially joined ${result.enrolledTrackNames?.join(", ") || "the track"}.`,
      link: "/",
      eventKey: `enrollment:${user.id}:${code}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined bootcamp track!",
        enrolledTrackNames: result.enrolledTrackNames,
        bootcampName: result.bootcampName,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Join bootcamp error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your enrollment." },
      { status: 500 }
    );
  }
}
