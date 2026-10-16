"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { ToastStack, type ToastItem, type ToastKind } from "@/components/admin/toast";
import { UploadPanel } from "@/components/admin/upload-panel";
import { ManagePanel } from "@/components/admin/manage-panel";
import { MessagesPanel } from "@/components/admin/messages-panel";
import { SettingsPanel } from "@/components/admin/settings-panel";
import type {
  MessageDTO,
  Paginated,
  PhotoDTO,
  SiteSettingsDTO,
} from "@/lib/types";

type TabId = "overview" | "upload" | "photos" | "messages" | "settings";

interface Stats {
  total: number;
  published: number;
  featured: number;
}

interface DashboardClientProps {
  username: string;
  provider: string;
  maxMb: number;
  initialPhotos: Paginated<PhotoDTO>;
  initialStats: Stats;
  initialMessages: { items: MessageDTO[]; unread: number };
  initialSettings: SiteSettingsDTO;
}

const NAV: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "upload", label: "Upload" },
  { id: "photos", label: "Photographs" },
  { id: "messages", label: "Messages" },
  { id: "settings", label: "Settings" },
];

const TAB_TITLES: Record<TabId, string> = {
  overview: "Overview",
  upload: "Upload photographs",
  photos: "Manage photographs",
  messages: "Messages",
  settings: "Settings",
};

export function DashboardClient({
  username,
  provider,
  maxMb,
  initialPhotos,
  initialStats,
  initialMessages,
  initialSettings,
}: DashboardClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");
  const [photos, setPhotos] = useState(initialPhotos);
  const [stats, setStats] = useState(initialStats);
  const [messages, setMessages] = useState(initialMessages);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const toastCounter = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      toastCounter.current += 1;
      const id = `toast-${toastCounter.current}`;
      setToasts((current) => [...current, { id, kind, message }]);
      window.setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast],
  );

  const handleUnauthorized = useCallback(() => {
    router.replace("/admin/login");
    router.refresh();
  }, [router]);

  const refreshPhotos = useCallback(async () => {
    const response = await fetch("/api/admin/photos?page=1&pageSize=24", {
      cache: "no-store",
    });
    if (response.status === 401) {
      handleUnauthorized();
      return;
    }
    if (!response.ok) return;
    const data = (await response.json()) as {
      photos: Paginated<PhotoDTO>;
      stats: Stats;
    };
    setPhotos(data.photos);
    setStats(data.stats);
  }, [handleUnauthorized]);

  const loadMorePhotos = useCallback(async () => {
    if (loadingMore || !photos.hasMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/admin/photos?page=${photos.page + 1}&pageSize=${photos.pageSize}`,
        { cache: "no-store" },
      );
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as { photos: Paginated<PhotoDTO> };
      setPhotos((current) => ({
        ...data.photos,
        items: [...current.items, ...data.photos.items],
      }));
    } finally {
      setLoadingMore(false);
    }
  }, [handleUnauthorized, loadingMore, photos.hasMore, photos.page, photos.pageSize]);

  const refreshMessages = useCallback(async () => {
    const response = await fetch("/api/admin/messages", { cache: "no-store" });
    if (response.status === 401) {
      handleUnauthorized();
      return;
    }
    if (!response.ok) return;
    const data = (await response.json()) as {
      items: MessageDTO[];
      unread: number;
    };
    setMessages(data);
  }, [handleUnauthorized]);

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }, [router]);

  const selectTab = (id: TabId) => {
    setTab(id);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  const statCards = [
    { label: "Total photographs", value: stats.total },
    { label: "Published", value: stats.published },
    { label: "Featured", value: stats.featured },
    { label: "Unread messages", value: messages.unread },
  ];

  const navList = (onSelect: (id: TabId) => void) => (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const active = tab === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                active
                  ? "bg-gold font-medium text-navy"
                  : "text-mist hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              {item.id === "messages" && messages.unread > 0 ? (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                    active ? "bg-navy text-gold" : "bg-gold text-navy"
                  }`}
                >
                  {messages.unread}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="admin-theme min-h-screen bg-navy text-white">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="lg:flex">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-navy-2 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="border-b border-white/10 px-7 py-7">
              <Logo variant="navy" />
              <p className="mt-3 text-[0.62rem] uppercase tracking-[0.28em] text-mist/60">
                Admin Dashboard
              </p>
            </div>
            <nav className="p-4" aria-label="Dashboard">
              {navList(selectTab)}
            </nav>
          </div>
          <div className="border-t border-white/10 p-4">
            <p className="px-4 pb-3 text-xs text-mist/60">
              Signed in as <span className="text-white">{username}</span>
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="admin-btn-outline w-full"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-navy/90 px-5 py-3.5 backdrop-blur lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open dashboard menu"
                aria-expanded={sidebarOpen}
                aria-controls="admin-mobile-menu"
                className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 lg:hidden"
              >
                <span className="h-px w-5 bg-white" />
                <span className="h-px w-5 bg-gold" />
                <span className="h-px w-5 bg-white" />
              </button>
              <span className="hidden shrink-0 sm:inline-flex lg:hidden">
                <Logo variant="navy" />
              </span>
              <span className="hidden h-8 w-px bg-white/10 lg:block" />
              <div className="min-w-0">
                <p className="hidden text-[0.58rem] uppercase tracking-[0.3em] text-mist/60 sm:block">
                  Admin Dashboard
                </p>
                <h1 className="truncate text-sm font-medium tracking-tight text-white sm:text-base">
                  {TAB_TITLES[tab]}
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="hidden shrink-0 text-xs font-medium uppercase tracking-[0.18em] text-mist/70 transition-colors hover:text-gold sm:block"
            >
              Sign out
            </button>
          </header>

          <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-12">
            {tab === "overview" ? (
              <div className="space-y-8">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {statCards.map((card) => (
                    <div key={card.label} className="admin-panel p-6">
                      <p className="text-3xl font-light tracking-tight text-gold">
                        {card.value}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-mist/60">
                        {card.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="admin-panel p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-medium tracking-tight text-white">
                      Recently uploaded
                    </h2>
                    <button
                      type="button"
                      onClick={() => selectTab("upload")}
                      className="admin-btn-primary"
                    >
                      Upload more
                    </button>
                  </div>

                  {photos.items.length > 0 ? (
                    <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                      {photos.items.slice(0, 6).map((photo) => (
                        <li
                          key={photo.id}
                          className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-navy"
                        >
                          <Image
                            src={photo.url}
                            alt={photo.title || "Photograph"}
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 rounded-xl border border-dashed border-white/15 px-6 py-14 text-center text-sm text-mist/60">
                      No photographs yet. Use the Upload tab to add your first
                      images.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {tab === "upload" ? (
              <UploadPanel
                maxMb={maxMb}
                provider={provider}
                onUploaded={() => void refreshPhotos()}
                notify={notify}
                onUnauthorized={handleUnauthorized}
              />
            ) : null}

            {tab === "photos" ? (
              <ManagePanel
                photos={photos.items}
                totalPhotos={photos.total}
                hasMore={photos.hasMore}
                loadingMore={loadingMore}
                onLoadMore={() => void loadMorePhotos()}
                onChanged={refreshPhotos}
                notify={notify}
                onUnauthorized={handleUnauthorized}
              />
            ) : null}

            {tab === "messages" ? (
              <MessagesPanel
                messages={messages.items}
                onChanged={refreshMessages}
                notify={notify}
                onUnauthorized={handleUnauthorized}
              />
            ) : null}

            {tab === "settings" ? (
              <SettingsPanel
                username={username}
                provider={provider}
                initialSettings={initialSettings}
                onUnauthorized={handleUnauthorized}
                onLogout={() => void logout()}
                notify={notify}
              />
            ) : null}
          </div>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
          />
          <div
            id="admin-mobile-menu"
            className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col justify-between border-r border-white/10 bg-navy-2 animate-fade-in"
          >
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-6">
                <div>
                  <Logo variant="navy" onNavigate={() => setSidebarOpen(false)} />
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.28em] text-mist/60">
                    Admin Dashboard
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close dashboard menu"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-mist transition-colors hover:border-gold hover:text-gold"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <nav className="p-4" aria-label="Dashboard mobile">
                {navList(selectTab)}
              </nav>
            </div>
            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => void logout()}
                className="admin-btn-outline w-full"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
