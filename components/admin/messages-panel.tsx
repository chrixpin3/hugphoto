"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { ToastKind } from "@/components/admin/toast";
import type { MessageDTO } from "@/lib/types";

interface MessagesPanelProps {
  messages: MessageDTO[];
  onChanged: () => Promise<void> | void;
  notify: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

const ACTION_BTN =
  "rounded-full border border-white/20 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50";
const DANGER_BTN =
  "rounded-full border border-red-400/40 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export function MessagesPanel({
  messages,
  onChanged,
  notify,
  onUnauthorized,
}: MessagesPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<MessageDTO | null>(null);

  const request = async (
    url: string,
    init: RequestInit,
    successMessage: string,
  ) => {
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
    }
  };

  const toggleRead = async (message: MessageDTO) => {
    setBusyId(message.id);
    await request(
      `/api/admin/messages/${message.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !message.read }),
      },
      message.read ? "Marked as unread." : "Marked as read.",
    );
    setBusyId(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    const ok = await request(
      `/api/admin/messages/${deleting.id}`,
      { method: "DELETE" },
      "Message deleted.",
    );
    setBusyId(null);
    if (ok) setDeleting(null);
  };

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 px-6 py-20 text-center text-sm text-mist/60">
        No messages yet. Enquiries from the contact form will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`admin-panel p-6 ${
            message.read ? "" : "border-gold/40"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-white">
                  {message.name}
                </h3>
                {!message.read ? (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-navy">
                    New
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-mist/50">
                <a
                  href={`mailto:${message.email}`}
                  className="transition-colors hover:text-gold"
                >
                  {message.email}
                </a>
                {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                {formatDate(message.createdAt)}
              </p>
              {message.service || message.preferredDate ? (
                <p className="mt-1 text-xs text-mist/50">
                  {message.service ? (
                    <span className="font-medium text-mist">
                      {message.service}
                    </span>
                  ) : null}
                  {message.service && message.preferredDate ? " · " : ""}
                  {message.preferredDate
                    ? `Preferred: ${message.preferredDate}`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void toggleRead(message)}
                disabled={busyId === message.id}
                className={ACTION_BTN}
              >
                {message.read ? "Mark unread" : "Mark read"}
              </button>
              <button
                type="button"
                onClick={() => setDeleting(message)}
                disabled={busyId === message.id}
                className={DANGER_BTN}
              >
                Delete
              </button>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-mist/80">
            {message.message}
          </p>
        </article>
      ))}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete message"
        description="This message will be permanently removed."
        confirmLabel="Delete"
        destructive
        busy={busyId === deleting?.id}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
