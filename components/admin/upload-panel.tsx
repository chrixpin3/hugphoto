"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PhotoDTO } from "@/lib/types";
import type { ToastKind } from "@/components/admin/toast";

type EntryStatus = "queued" | "uploading" | "done" | "error";

interface Entry {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: EntryStatus;
  error?: string;
}

interface UploadPanelProps {
  maxMb: number;
  provider: string;
  onUploaded: (photo: PhotoDTO) => void;
  notify: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

let entryCounter = 0;

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function UploadPanel({
  maxMb,
  provider,
  onUploaded,
  notify,
  onUnauthorized,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const entriesRef = useRef<Entry[]>([]);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    return () => {
      for (const entry of entriesRef.current) {
        URL.revokeObjectURL(entry.preview);
      }
    };
  }, []);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const accepted: Entry[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} is not an image`);
        continue;
      }
      if (file.size > maxMb * 1024 * 1024) {
        rejected.push(`${file.name} exceeds ${maxMb}MB`);
        continue;
      }
      entryCounter += 1;
      accepted.push({
        id: `entry-${Date.now()}-${entryCounter}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "queued",
      });
    }

    if (accepted.length > 0) setEntries((current) => [...current, ...accepted]);
    if (rejected.length > 0) notify("error", rejected.join(". "));
  };

  const removeEntry = (id: string) => {
    setEntries((current) => {
      const target = current.find((entry) => entry.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((entry) => entry.id !== id);
    });
  };

  const updateEntry = (id: string, patch: Partial<Entry>) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  };

  const uploadEntry = (entry: Entry) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/photos");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          updateEntry(entry.id, {
            progress: Math.round((event.loaded / event.total) * 100),
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = parseJson<{ photo: PhotoDTO }>(xhr.responseText);
          if (data?.photo) onUploaded(data.photo);
          resolve();
        } else if (xhr.status === 401) {
          onUnauthorized();
          reject(new Error("Your session has expired. Please sign in again."));
        } else {
          const data = parseJson<{ error?: string }>(xhr.responseText);
          reject(new Error(data?.error || "Upload failed."));
        }
      };

      xhr.onerror = () => reject(new Error("Network error while uploading."));

      const form = new FormData();
      form.append("file", entry.file);
      if (title.trim()) form.append("title", title.trim());
      if (category.trim()) form.append("category", category.trim());
      if (featured) form.append("featured", "true");
      xhr.send(form);
    });

  const startUpload = async () => {
    const pending = entries.filter(
      (entry) => entry.status === "queued" || entry.status === "error",
    );
    if (pending.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const entry of pending) {
      updateEntry(entry.id, { status: "uploading", progress: 0, error: undefined });
      try {
        await uploadEntry(entry);
        updateEntry(entry.id, { status: "done", progress: 100 });
        successCount += 1;
      } catch (error) {
        updateEntry(entry.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed.",
        });
      }
    }

    setUploading(false);

    if (successCount > 0) {
      notify(
        "success",
        `${successCount} photograph${successCount === 1 ? "" : "s"} uploaded successfully.`,
      );
      setEntries((current) =>
        current.filter((entry) => entry.status !== "done"),
      );
    }
  };

  const queuedCount = entries.filter(
    (entry) => entry.status === "queued" || entry.status === "error",
  ).length;

  return (
    <div className="space-y-8">
      <div className="admin-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium tracking-tight text-white">
            Upload photographs
          </h2>
          <span className="text-xs uppercase tracking-[0.18em] text-mist/50">
            {provider === "cloudinary" ? "Cloudinary storage" : "Local storage"}
          </span>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={`mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center transition-colors ${
            dragging
              ? "border-gold bg-white/5"
              : "border-white/15 hover:border-gold/60"
          }`}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-mist/50"
            aria-hidden="true"
          >
            <path d="M12 16V4M7 9l5-5 5 5" />
            <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          <p className="mt-5 text-sm text-mist/70">
            Drag &amp; drop images here, or
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="admin-btn-outline mt-3"
          >
            Choose files
          </button>
          <p className="mt-4 text-xs text-mist/50">
            JPEG, PNG, WebP, AVIF or GIF · up to {maxMb}MB each
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="upload-title" className="admin-label">
              Title (optional)
            </label>
            <input
              id="upload-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={140}
              placeholder="Applied to every file"
              className="admin-input mt-2"
            />
          </div>
          <div>
            <label htmlFor="upload-category" className="admin-label">
              Category (optional)
            </label>
            <input
              id="upload-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              maxLength={60}
              placeholder="e.g. Weddings"
              className="admin-input mt-2"
            />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm text-mist/80">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Feature these photographs on the homepage
        </label>
      </div>

      {entries.length > 0 ? (
        <div className="admin-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-mist/60">
              {entries.length} selected
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  for (const entry of entries) URL.revokeObjectURL(entry.preview);
                  setEntries([]);
                }}
                disabled={uploading}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-mist/60 transition-colors hover:text-white disabled:opacity-50"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => void startUpload()}
                disabled={uploading || queuedCount === 0}
                className="admin-btn-primary"
              >
                {uploading ? "Uploading…" : `Upload ${queuedCount || ""}`}
              </button>
            </div>
          </div>

          <ul className="mt-6 space-y-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-navy/40 p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-navy">
                  <Image
                    src={entry.preview}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{entry.file.name}</p>
                  <p className="mt-1 text-xs text-mist/50">
                    {(entry.file.size / (1024 * 1024)).toFixed(2)}MB
                  </p>
                  {entry.status === "uploading" ? (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-1 bg-gold transition-all"
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                  ) : null}
                  {entry.status === "error" && entry.error ? (
                    <p className="mt-1 text-xs text-red-300">{entry.error}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.14em] text-mist/50">
                    {entry.status === "done"
                      ? "Done"
                      : entry.status === "uploading"
                        ? `${entry.progress}%`
                        : entry.status === "error"
                          ? "Failed"
                          : "Ready"}
                  </span>
                  {entry.status !== "uploading" ? (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      aria-label={`Remove ${entry.file.name}`}
                      className="text-mist/50 transition-colors hover:text-gold"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
