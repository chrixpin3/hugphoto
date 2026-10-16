import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/admin/dashboard-client";
import { requireAdmin } from "@/lib/auth";
import { getMaxUploadBytes } from "@/lib/env";
import { countPhotos, listAllPhotos } from "@/lib/photos";
import { listMessages } from "@/lib/messages";
import { getSettings } from "@/lib/settings";
import { activeStorageProvider } from "@/lib/storage";

export const dynamic = "force-dynamic";

async function loadDashboard() {
  const [photos, stats, messages, settings] = await Promise.all([
    listAllPhotos({ page: 1, pageSize: 24 }),
    countPhotos(),
    listMessages(),
    getSettings(),
  ]);
  return { photos, stats, messages, settings };
}

export default async function AdminDashboardPage() {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    admin = null;
  }

  if (!admin) redirect("/admin/login");

  let data: Awaited<ReturnType<typeof loadDashboard>> | null = null;
  try {
    data = await loadDashboard();
  } catch (error) {
    console.error("[admin/dashboard] Failed to load dashboard:", error);
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-light tracking-tight text-ink">
            Dashboard unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            We could not reach the database. Check your <code>MONGODB_URI</code>{" "}
            configuration and reload this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      username={admin.username}
      provider={activeStorageProvider()}
      maxMb={Math.round(getMaxUploadBytes() / (1024 * 1024))}
      initialPhotos={data.photos}
      initialStats={data.stats}
      initialMessages={data.messages}
      initialSettings={data.settings}
    />
  );
}
