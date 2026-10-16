import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import {
  createSessionToken,
  hashPassword,
  requireAdmin,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validation";
import { Admin, type AdminRecord } from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = passwordChangeSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    const valid = await verifyPassword(
      parsed.data.currentPassword,
      admin.passwordHash,
    );
    if (!valid) return fail("Current password is incorrect.", 400);

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return fail("New password must be different from the current password.", 422);
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    // Bumping sessionVersion revokes every outstanding session token; the
    // caller immediately receives a fresh cookie for the new version.
    const updated = await Admin.findOneAndUpdate(
      { _id: admin._id },
      { $set: { passwordHash }, $inc: { sessionVersion: 1 } },
      { new: true },
    )
      .lean<AdminRecord | null>()
      .exec();

    const token = await createSessionToken({
      username: admin.username,
      version: updated?.sessionVersion ?? (admin.sessionVersion ?? 0) + 1,
    });
    await setSessionCookie(token);

    return ok({ success: true });
  } catch (error) {
    console.error("[api/admin/password] Password change failed:", error);
    return fail("Unable to update the password right now.", 500);
  }
}
