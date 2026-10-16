import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin, type AdminDocument, type AdminRecord } from "@/models/Admin";
import {
  SESSION_COOKIE,
  getAuthSecret,
  getInitialAdminCredentials,
  getSessionMaxAgeSeconds,
} from "@/lib/env";

export interface SessionPayload {
  username: string;
  version: number;
}

const BCRYPT_ROUNDS = 12;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getAuthSecret());
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ username: payload.username, v: payload.version })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${getSessionMaxAgeSeconds()}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const username = typeof payload.username === "string" ? payload.username : "";
    if (!username) return null;
    const version =
      typeof payload.v === "number" && Number.isFinite(payload.v)
        ? payload.v
        : 0;
    return { username, version };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<AdminRecord | null> {
  const session = await getSession();
  if (!session) return null;

  await connectDB();
  const admin = await Admin.findOne({ username: session.username })
    .select("+passwordHash")
    .lean<AdminRecord>()
    .exec();

  if (!admin) return null;
  // Reject tokens issued before the last logout/password change.
  if ((admin.sessionVersion ?? 0) !== session.version) return null;

  return admin;
}

// Invalidates every outstanding session token for the administrator by
// bumping their session version. Best-effort: callers log but ignore errors
// (e.g. during logout when the database is briefly unreachable).
export async function revokeAdminSessions(username: string): Promise<void> {
  await connectDB();
  await Admin.updateOne({ username }, { $inc: { sessionVersion: 1 } }).exec();
}

export async function findAdminByUsername(
  username: string,
): Promise<(AdminDocument & { passwordHash: string }) | null> {
  await connectDB();
  return Admin.findOne({ username })
    .select("+passwordHash")
    .lean<AdminDocument & { passwordHash: string }>()
    .exec();
}

// One-time bootstrap: creates the first administrator only when the database
// contains no administrator at all AND explicit initial credentials are
// provided through server-side environment variables. Existing administrators
// are never overwritten.
export async function ensureAdminSeeded(): Promise<{ seeded: boolean }> {
  await connectDB();
  const count = await Admin.estimatedDocumentCount();
  if (count > 0) return { seeded: false };

  const credentials = getInitialAdminCredentials();
  if (!credentials) return { seeded: false };

  const passwordHash = await hashPassword(credentials.password);
  await Admin.create({ username: credentials.username, passwordHash });

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[HUG Photos] Seeded initial administrator "${credentials.username}". ` +
        "Change this password from the dashboard before deploying.",
    );
  }

  return { seeded: true };
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
