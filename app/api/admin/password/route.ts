import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import {
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validation";
import { Admin } from "@/models/Admin";

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
    await Admin.updateOne(
      { _id: admin._id },
      { $set: { passwordHash } },
    ).exec();

    return ok({ success: true });
  } catch (error) {
    console.error("[api/admin/password] Password change failed:", error);
    return fail("Unable to update the password right now.", 500);
  }
}
