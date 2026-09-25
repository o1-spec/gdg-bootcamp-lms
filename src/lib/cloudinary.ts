import "server-only";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  formatFileSize,
  sanitizeFileName,
  validateFile,
  suggestResourceType,
} from "./cloudinary-constants";

// Re-export constants and pure validators
export {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  formatFileSize,
  sanitizeFileName,
  validateFile,
  suggestResourceType,
};

/**
 * Configure Cloudinary instance securely using server-only environment variables
 */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Check if Cloudinary credentials are fully configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  format?: string;
}

/**
 * Upload a file buffer to Cloudinary
 * Falls back to offline mock generation if Cloudinary credentials are not supplied
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    originalFileName: string;
    mimeType: string;
  }
): Promise<CloudinaryUploadResult> {
  const { folder, originalFileName, mimeType } = options;
  const sanitized = sanitizeFileName(originalFileName);
  const ext = originalFileName.split(".").pop()?.toLowerCase() || "";

  // Cloudinary resource_type: images must be "image", PDFs/raw docs/zips are "raw" or "auto"
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf" || ext === "pdf";
  const resourceType = isImage ? "image" : isPdf ? "auto" : "raw";

  if (!isCloudinaryConfigured()) {
    // Graceful offline development simulation if user hasn't added Cloudinary API credentials yet
    console.warn(
      "[Cloudinary] Credentials not configured. Simulating offline successful upload for development."
    );
    const mockId = `${folder}/${Date.now()}_${sanitized}`.replace(/\/+/g, "/");
    return {
      secureUrl: `https://res.cloudinary.com/gdglasu/raw/upload/v1/${mockId}`,
      publicId: mockId,
      originalFileName: sanitized,
      fileSize: buffer.length,
      mimeType,
      format: ext,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("[Cloudinary] Upload failed:", error);
          return reject(new Error(error?.message || "Cloudinary upload failed"));
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          originalFileName: sanitized,
          fileSize: result.bytes || buffer.length,
          mimeType,
          format: result.format || ext,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Safely delete an asset from Cloudinary by its publicId
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return true;

  if (!isCloudinaryConfigured()) {
    console.log(`[Cloudinary Mock] Deleting asset ${publicId} (offline mode)`);
    return true;
  }

  try {
    // Try destroying as raw first, fallback to image if not found
    let res = await cloudinary.uploader.destroy(publicId, { resource_type: "raw", invalidate: true });
    if (res?.result !== "ok") {
      res = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    }
    return res?.result === "ok" || res?.result === "not found";
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, error);
    return false;
  }
}
