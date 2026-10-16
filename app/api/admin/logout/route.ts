import { ok } from "@/lib/http";
import { clearSessionCookie, getSession, revokeAdminSessions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (session) {
    // Invalidate the token server-side too, not just in the browser.
    try {
      await revokeAdminSessions(session.username);
    } catch (error) {
      console.error("[api/admin/logout] Failed to revoke sessions:", error);
    }
  }
  await clearSessionCookie();
  return ok({ success: true });
}
