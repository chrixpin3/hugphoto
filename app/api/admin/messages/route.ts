import { fail, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { listMessages } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  try {
    const data = await listMessages();
    return ok(data);
  } catch (error) {
    console.error("[api/admin/messages] Failed to load messages:", error);
    return fail("Unable to load messages right now.", 500);
  }
}
