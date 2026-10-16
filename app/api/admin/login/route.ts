import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import {
  createSessionToken,
  ensureAdminSeeded,
  findAdminByUsername,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import {
  checkRateLimit,
  clearFailures,
  clientIp,
  recordFailure,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid credentials.", 422);
  }

  const username = parsed.data.username.toLowerCase();
  const rateKey = `${clientIp(request.headers)}|${username}`;

  const limited = checkRateLimit(rateKey);
  if (!limited.allowed) {
    return new Response(
      JSON.stringify({
        error:
          "Too many failed sign-in attempts. Please wait a few minutes and try again.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(limited.retryAfterSeconds),
        },
      },
    );
  }

  try {
    await ensureAdminSeeded();

    const admin = await findAdminByUsername(parsed.data.username);
    const valid = admin
      ? await verifyPassword(parsed.data.password, admin.passwordHash)
      : false;

    if (!admin || !valid) {
      recordFailure(rateKey);
      return fail("Incorrect username or password.", 401);
    }

    clearFailures(rateKey);

    const token = await createSessionToken({
      username: admin.username,
      version: admin.sessionVersion ?? 0,
    });
    await setSessionCookie(token);

    return ok({ username: admin.username });
  } catch (error) {
    console.error("[api/admin/login] Sign in failed:", error);
    return fail("Unable to sign in right now. Please try again.", 500);
  }
}
