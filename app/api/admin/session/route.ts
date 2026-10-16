import { ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // requireAdmin validates the token AND checks it against the stored session
  // version, so logged-out (revoked) tokens report as unauthenticated.
  const admin = await requireAdmin();
  return ok({
    authenticated: Boolean(admin),
    username: admin?.username ?? null,
  });
}
