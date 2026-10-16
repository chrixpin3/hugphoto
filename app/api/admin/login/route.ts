import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import {
  createSessionToken,
  ensureAdminSeeded,
  findAdminByUsername,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
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

  try {
    await ensureAdminSeeded();

    const admin = await findAdminByUsername(parsed.data.username);
    const valid = admin
      ? await verifyPassword(parsed.data.password, admin.passwordHash)
      : false;

    if (!admin || !valid) {
      return fail("Incorrect username or password.", 401);
    }

    const token = await createSessionToken({ username: admin.username });
    await setSessionCookie(token);

    return ok({ username: admin.username });
  } catch (error) {
    console.error("[api/admin/login] Sign in failed:", error);
    return fail("Unable to sign in right now. Please try again.", 500);
  }
}
