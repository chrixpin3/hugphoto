import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  let authenticated = false;
  try {
    // requireAdmin (not just the JWT) so revoked sessions land on this page
    // instead of bouncing between /admin/dashboard and /admin/login.
    authenticated = Boolean(await requireAdmin());
  } catch {
    authenticated = false;
  }

  if (authenticated) redirect("/admin/dashboard");

  return <LoginForm />;
}
