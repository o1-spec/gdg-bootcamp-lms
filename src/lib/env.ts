/**
 * Server-side Environment Validation
 * Validates essential configuration variables at boot time without leaking secrets.
 */

interface ServerEnv {
  DATABASE_URL: string;
  DIRECT_URL?: string;
  AUTH_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  NODE_ENV: "development" | "production" | "test";
}

function validateEnv(): ServerEnv {
  const errors: string[] = [];

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    errors.push("DATABASE_URL is required for PostgreSQL connection");
  }

  const AUTH_SECRET = process.env.AUTH_SECRET;
  if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
    errors.push("AUTH_SECRET must be defined and at least 32 characters long for session security");
  }

  const NODE_ENV = (process.env.NODE_ENV || "development") as ServerEnv["NODE_ENV"];

  // Warn if in production and Cloudinary credentials are missing
  if (NODE_ENV === "production") {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("[Env Warning] Cloudinary storage credentials are not fully configured in production. File uploads may fail.");
    }
  }

  if (errors.length > 0) {
    const errorMsg = `\n========================================\n❌ CRITICAL CONFIGURATION ERROR\n========================================\n${errors.map((e) => ` - ${e}`).join("\n")}\n========================================\n`;
    if (NODE_ENV === "production") {
      throw new Error(errorMsg);
    } else {
      console.warn(errorMsg);
    }
  }

  return {
    DATABASE_URL: DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL,
    AUTH_SECRET: AUTH_SECRET || "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NODE_ENV,
  };
}

export const serverEnv = validateEnv();
