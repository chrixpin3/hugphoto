import { ok } from "@/lib/http";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  return ok({
    authenticated: Boolean(session),
    username: session?.username ?? null,
  });
}
