import { ResourceType } from "@prisma/client";

/**
 * Cloudinary Constants, Limits & Utility Helpers
 * Safe for both Client and Server Components (no Node.js or Cloudinary SDK dependencies)
 */

// Max allowed file size in bytes (15MB)
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_FILE_SIZE_MB = 15;

// Allowed MIME types for bootcamp resources and submissions
export const ALLOWED_MIME_TYPES = new Set([
  // Documents & PDFs
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  // Archives & Code
  "application/zip",
  "application/x-zip-compressed",
  "application/x-tar",
  "application/gzip",
  "application/json",
  // Microsoft Office & OpenDocument
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

// Allowed file extensions fallback check
export const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "svg",
  "txt",
  "csv",
  "md",
  "zip",
  "tar",
  "gz",
  "json",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
]);

/**
 * Format raw bytes into human-readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes?: number | null): string {
  if (bytes === undefined || bytes === null || bytes <= 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Sanitize original filename to remove potentially dangerous characters and traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_");
}

/**
 * Validate file against size limits and allowed MIME types/extensions
 */
export function validateFile(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: "No file was provided" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB. (Your file: ${formatFileSize(file.size)})`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "File cannot be empty" };
  }

  // Check MIME type
  const mimeValid = file.type && ALLOWED_MIME_TYPES.has(file.type.toLowerCase());

  // Check extension fallback (useful if browser sets generic application/octet-stream)
  const ext = file.name.split(".").pop()?.toLowerCase();
  const extValid = ext ? ALLOWED_EXTENSIONS.has(ext) : false;

  if (!mimeValid && !extValid) {
    return {
      valid: false,
      error: `File type "${file.type || ext || "unknown"}" is not supported. Allowed formats include PDF, Images, Word, PowerPoint, Excel, ZIP, CSV, and Plain Text.`,
    };
  }

  return { valid: true };
}

/**
 * Suggest a ResourceType based on file MIME type and extension
 */
export function suggestResourceType(mimeType: string, fileName: string): ResourceType {
  const mime = mimeType.toLowerCase();
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (mime === "application/pdf" || ext === "pdf") {
    return ResourceType.PDF;
  }
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
    return ResourceType.OTHER; // or document/image depending on usage
  }
  if (
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    ["ppt", "pptx"].includes(ext)
  ) {
    return ResourceType.SLIDE;
  }
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("opendocument") ||
    ["doc", "docx", "txt", "md"].includes(ext)
  ) {
    return ResourceType.DOCUMENT;
  }
  if (["zip", "tar", "gz", "json"].includes(ext)) {
    return ResourceType.CODE;
  }
  if (mime.includes("csv") || mime.includes("excel") || mime.includes("spreadsheet") || ["csv", "xls", "xlsx"].includes(ext)) {
    return ResourceType.DATASET;
  }

  return ResourceType.OTHER;
}
