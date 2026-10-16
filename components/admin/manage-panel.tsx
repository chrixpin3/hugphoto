"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { ToastKind } from "@/components/admin/toast";
import type { PhotoDTO } from "@/lib/types";

interface ManagePanelProps {
  photos: PhotoDTO[];
  totalPhotos?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onChanged: () => Promise<void> | void;
  notify: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

type StatusFilter = "all" | "published" | "draft" | "featured";

interface EditState {
  title: string;
  category: string;
  featured: boolean;
  published: boolean;
}

const ACTION_BTN =
  "rounded-full border border-white/20 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50";
const DANGER_BTN =
  "rounded-full border border-red-400/40 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50";

export function ManagePanel({
  photos,
  totalPhotos,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onChanged,
  notify,
  onUnauthorized,
}: ManagePanelProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<PhotoDTO | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleting, setDeleting] = useState<PhotoDTO | null>(null);
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const photo of photos) if (photo.category) set.add(photo.category);
    return Array.from(set).sort();
  }, [photos]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return photos.filter((photo) => {
      if (category !== "all" && photo.category !== category) return false;
      if (status === "published" && !photo.published) return false;
      if (status === "draft" && photo.published) return false;
      if (status === "featured" && !photo.featured) return false;
      if (term) {
        const haystack = `${photo.title} ${photo.category}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [photos, category, status, search]);

  const request = async (
    url: string,
    init: RequestInit,
    successMessage: string,
  ) => {
    setBusy(true);
    try {
      const response = await fetch(url, init);
      if (response.status === 401) {
        onUnauthorized();
        return false;
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Request failed.");
      }
      notify("success", successMessage);
      await onChanged();
      return true;
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Something went wrong.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (photo: PhotoDTO) => {
    setEditing(photo);
    setEditState({
      title: photo.title,
      category: photo.category,
      featured: photo.featured,
      published: photo.published,
    });
  };

  const saveEdit = async () => {
    if (!editing || !editState) return;
    const ok = await request(
      `/api/admin/photos/${editing.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editState),
      },
      "Photograph updated.",
    );
    if (ok) {
      setEditing(null);
      setEditState(null);
    }
  };

  const toggleFeatured = (photo: PhotoDTO) =>
    request(
      `/api/admin/photos/${photo.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !photo.featured }),
      },
      photo.featured ? "Removed from homepage." : "Featured on homepage.",
    );

  const togglePublished = (photo: PhotoDTO) =>
    request(
      `/api/admin/photos/${photo.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !photo.published }),
      },
      photo.published ? "Moved to drafts." : "Published to gallery.",
    );

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await request(
      `/api/admin/photos/${deleting.id}`,
      { method: "DELETE" },
      "Photograph deleted.",
    );
    if (ok) setDeleting(null);
  };

  return (
    <div className="space-y-8">
      <div className="admin-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight text-white">
            Manage photographs
          </h2>
          <span className="text-xs uppercase tracking-[0.18em] text-mist/50">
            {typeof totalPhotos === "number" && totalPhotos > photos.length
              ? `${photos.length} of ${totalPhotos} loaded`
              : `${filtered.length} shown`}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or category"
            aria-label="Search photographs"
            className="admin-input"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="admin-input"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            aria-label="Filter by status"
            className="admin-input"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-20 text-center text-sm text-mist/60">
          No photographs match your filters.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((photo) => (
            <li
              key={photo.id}
              className="admin-panel overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-navy">
                <Image
                  src={photo.url}
                  alt={photo.title || "Photograph"}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  {photo.featured ? (
                    <span className="rounded-full bg-gold px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-navy">
                      Featured
                    </span>
                  ) : null}
                  {!photo.published ? (
                    <span className="rounded-full bg-navy/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-mist backdrop-blur">
                      Draft
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-4">
                <p className="truncate text-sm font-medium text-white">
                  {photo.title || "Untitled photograph"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-mist/50">
                  {photo.category || "Uncategorised"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(photo)}
                    disabled={busy}
                    className={ACTION_BTN}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleFeatured(photo)}
                    disabled={busy}
                    className={ACTION_BTN}
                  >
                    {photo.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void togglePublished(photo)}
                    disabled={busy}
                    className={ACTION_BTN}
                  >
                    {photo.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(photo)}
                    disabled={busy}
                    className={DANGER_BTN}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && onLoadMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="admin-btn-outline"
          >
            {loadingMore ? "Loading…" : "Load more photographs"}
          </button>
        </div>
      ) : null}

      {editing && editState ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-navy/70 px-4 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit photograph"
            className="admin-panel w-full max-w-lg p-7 shadow-lift"
          >
            <h2 className="text-lg font-medium tracking-tight text-white">
              Edit photograph
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="edit-title" className="admin-label">
                  Title
                </label>
                <input
                  id="edit-title"
                  value={editState.title}
                  onChange={(event) =>
                    setEditState({ ...editState, title: event.target.value })
                  }
                  maxLength={140}
                  className="admin-input mt-2"
                />
              </div>
              <div>
                <label htmlFor="edit-category" className="admin-label">
                  Category
                </label>
                <input
                  id="edit-category"
                  value={editState.category}
                  onChange={(event) =>
                    setEditState({ ...editState, category: event.target.value })
                  }
                  maxLength={60}
                  className="admin-input mt-2"
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 text-sm text-mist/80">
                  <input
                    type="checkbox"
                    checked={editState.featured}
                    onChange={(event) =>
                      setEditState({
                        ...editState,
                        featured: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-gold"
                  />
                  Featured on homepage
                </label>
                <label className="flex items-center gap-3 text-sm text-mist/80">
                  <input
                    type="checkbox"
                    checked={editState.published}
                    onChange={(event) =>
                      setEditState({
                        ...editState,
                        published: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-gold"
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setEditState(null);
                }}
                disabled={busy}
                className="admin-btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={busy}
                className="admin-btn-primary"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete photograph"
        description={
          deleting
            ? `"${deleting.title || "This photograph"}" will be permanently removed from storage and the gallery. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
