"use client";

export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

const STYLES: Record<ToastKind, string> = {
  success: "border-l-whatsapp",
  error: "border-l-red-500",
  info: "border-l-gold",
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,22rem)] flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start justify-between gap-4 rounded-xl border border-white/10 border-l-2 bg-navy-2 px-4 py-3 shadow-lift animate-fade-in ${STYLES[toast.kind]}`}
        >
          <p className="text-sm leading-relaxed text-white">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="mt-0.5 text-mist/60 transition-colors hover:text-gold"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
