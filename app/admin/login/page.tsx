import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  let authenticated = false;
  try {
    authenticated = Boolean(await getSession());
  } catch {
    authenticated = false;
  }

  if (authenticated) redirect("/admin/dashboard");

  return <LoginForm />;
}
