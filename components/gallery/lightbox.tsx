"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { PhotoDTO } from "@/lib/types";

interface LightboxProps {
  photos: PhotoDTO[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({
  photos,
  index,
  open,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const photo = photos[index];

  const goTo = useCallback(
    (delta: number) => {
      if (photos.length === 0) return;
      const next = (index + delta + photos.length) % photos.length;
      onIndexChange(next);
    },
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "ArrowLeft") goTo(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, goTo]);

  if (!open || !photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title || "Photograph"}
      className="fixed inset-0 z-[100] flex flex-col bg-neutral-950/97 animate-fade-in"
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="text-xs tracking-[0.24em] text-gold/80">
          {index + 1} / {photos.length}
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16">
        <button
          type="button"
          onClick={() => goTo(-1)}
          aria-label="Previous photograph"
          className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:left-6"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="relative h-full w-full">
          <Image
            key={photo.id}
            src={photo.url}
            alt={photo.title || "Photograph"}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        <button
          type="button"
          onClick={() => goTo(1)}
          aria-label="Next photograph"
          className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:right-6"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {photo.title ? (
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-white/80">{photo.title}</p>
        </div>
      ) : null}
    </div>
  );
}
