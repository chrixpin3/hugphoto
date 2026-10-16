"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Lightbox } from "@/components/gallery/lightbox";
import type { Paginated, PhotoDTO } from "@/lib/types";

const PAGE_SIZE = 24;

const STATIC_PHOTOS: PhotoDTO[] = [
  {
    id: "hug-photos-portfolio",
    title: "HUG Photos photography portfolio",
    category: "Portfolio",
    url: "/hug.png",
    width: 322,
    height: 483,
    featured: true,
    published: true,
    createdAt: new Date(0).toISOString(),
  },
];

export function GalleryView() {
  const [photos, setPhotos] = useState<PhotoDTO[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchPage = useCallback(async (targetPage: number) => {
    const response = await fetch(
      `/api/photos?page=${targetPage}&pageSize=${PAGE_SIZE}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      throw new Error("Failed to load photographs.");
    }
    return (await response.json()) as Paginated<PhotoDTO>;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPage(1);
      setPhotos(data.items);
      setPage(data.page);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch {
      setError("We could not load the gallery. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await fetchPage(1);
        if (!active) return;
        setPhotos(data.items);
        setPage(data.page);
        setHasMore(data.hasMore);
        setTotal(data.total);
      } catch {
        if (active) setError("We could not load the gallery. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const next = page + 1;
      const data = await fetchPage(next);
      setPhotos((current) => [...current, ...data.items]);
      setPage(data.page);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch {
      setError("We could not load more photographs. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, page]);

  const openPhoto = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const items = [...STATIC_PHOTOS, ...photos];
  const totalCount = total + STATIC_PHOTOS.length;
  const showSkeletons = loading && photos.length === 0;

  return (
    <div>
      {error && photos.length === 0 && !loading ? (
        <div className="mb-10 flex flex-col items-center rounded-2xl border border-white/10 bg-navy-2/60 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-mist">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold transition-colors duration-300 hover:bg-gold hover:text-navy sm:mt-0"
          >
            Try again
          </button>
        </div>
      ) : null}

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {items.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => openPhoto(index)}
            aria-label={`View ${photo.title || "photograph"} in full screen`}
            className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-xl border border-white/10 bg-navy-2 text-left transition-colors duration-300 hover:border-gold/50"
          >
            <div className="relative overflow-hidden">
              <Image
                src={photo.url}
                alt={photo.title || "Photograph"}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/30" />
            </div>
          </button>
        ))}

        {showSkeletons
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="mb-5 animate-pulse break-inside-avoid rounded-xl border border-white/10 bg-navy-2"
                style={{ height: `${220 + (index % 3) * 90}px` }}
              />
            ))
          : null}
      </div>

      {error && photos.length > 0 ? (
        <p className="mt-8 text-center text-sm text-gold/90">{error}</p>
      ) : null}

      {hasMore ? (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex items-center gap-3 rounded-full border-2 border-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold transition-all duration-300 hover:bg-gold hover:text-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      {!loading && !hasMore && !error ? (
        <p className="mt-12 text-center text-xs uppercase tracking-[0.2em] text-mist/60">
          {totalCount} photograph{totalCount === 1 ? "" : "s"}
        </p>
      ) : null}

      <Lightbox
        photos={items}
        index={activeIndex}
        open={open}
        onClose={() => setOpen(false)}
        onIndexChange={setActiveIndex}
      />
    </div>
  );
}
