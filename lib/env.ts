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
  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      "MONGODB_URI must start with mongodb:// or mongodb+srv://.",
    );
  }
  // Guard against writing into MongoDB's default "test" database when the
  // connection string has no database path (e.g. "...mongodb.net/").
  const match = uri.match(/^mongodb(\+srv)?:\/\/([^/?]+)(\/[^?]*)?(\?.*)?$/i);
  if (match) {
    const host = match[2];
    const dbPath = (match[3] ?? "").replace(/\/$/, "");
    const query = match[4] ?? "";
    if (!dbPath) {
      return `mongodb${match[1] ?? ""}://${host}/hugphotos${query}`;
    }
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

// Initial-admin credentials for the one-time bootstrap. Returns null unless a
// username AND password are explicitly provided via the server-side environment
// (ADMIN_INITIAL_USERNAME/ADMIN_INITIAL_PASSWORD, with ADMIN_USERNAME/
// ADMIN_PASSWORD kept as legacy aliases). There is deliberately no built-in
// default password: seeding must never be possible with a guessable value.
export function getInitialAdminCredentials(): {
  username: string;
  password: string;
} | null {
  const username = (
    process.env.ADMIN_INITIAL_USERNAME?.trim() ||
    process.env.ADMIN_USERNAME?.trim() ||
    ""
  ).slice(0, 60);
  const password =
    process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || "";

  if (!username || !password) return null;
  if (username.length < 3) {
    throw new Error(
      "ADMIN_INITIAL_USERNAME must be at least 3 characters long.",
    );
  }
  if (password.length < 8) {
    throw new Error(
      "ADMIN_INITIAL_PASSWORD must be at least 8 characters long.",
    );
  }
  return { username, password };
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
