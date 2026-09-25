import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/lib/cloudinary";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No avatar image provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Upload new avatar first
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: "bootcamp-lms/avatars",
      originalFileName: file.name || "avatar.webp",
      mimeType: file.type,
    });

    const oldPublicId = user.avatarPublicId;

    // 2. Update database with new avatar
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: uploadResult.secureUrl,
        avatarPublicId: uploadResult.publicId,
      },
    });

    // 3. Delete old asset safely after DB update
    if (oldPublicId && oldPublicId !== uploadResult.publicId) {
      deleteFromCloudinary(oldPublicId).catch((err) => {
        console.warn("[avatar] Failed to delete old avatar asset:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: uploadResult.secureUrl,
      avatarPublicId: uploadResult.publicId,
    });
  } catch (error) {
    console.error("POST /api/upload/avatar error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar image" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oldPublicId = user.avatarPublicId;

    // 1. Remove avatar from database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: null,
        avatarPublicId: null,
      },
    });

    // 2. Delete asset from Cloudinary
    if (oldPublicId) {
      deleteFromCloudinary(oldPublicId).catch((err) => {
        console.warn("[avatar] Failed to delete avatar asset on remove:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/upload/avatar error:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar image" },
      { status: 500 }
    );
  }
}
