export const SESSION_COOKIE = "hug_session";

const DEV_SECRET = "dev-only-insecure-secret-change-me";

function intFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET must be set to a strong value (16+ characters) in production.",
    );
  }
  return DEV_SECRET;
}

export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to your .env.local file.",
    );
  }
  return uri;
}

export function getSessionMaxAgeSeconds(): number {
  return intFromEnv(process.env.AUTH_SESSION_MAX_AGE, 60 * 60 * 24 * 7);
}

export function getMaxUploadBytes(): number {
  const mb = intFromEnv(process.env.MAX_UPLOAD_MB, 15);
  return mb * 1024 * 1024;
}

export function getInitialAdminCredentials(): {
  username: string;
  password: string;
} {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "Admin",
    password: process.env.ADMIN_PASSWORD || "admin@123",
  };
}

export function getCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
} | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) return null;
  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: process.env.CLOUDINARY_FOLDER?.trim() || "hug-photos",
  };
}
