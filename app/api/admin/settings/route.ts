import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  try {
    const settings = await getSettings();
    return ok({ settings });
  } catch (error) {
    console.error("[api/admin/settings] Failed to load settings:", error);
    return fail("Unable to load settings right now.", 500);
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    const settings = await updateSettings(parsed.data);
    return ok({ settings });
  } catch (error) {
    console.error("[api/admin/settings] Failed to save settings:", error);
    return fail("Unable to save settings right now.", 500);
  }
}
