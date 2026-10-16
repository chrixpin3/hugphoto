import type { Metadata } from "next";
import { GalleryView } from "@/components/gallery/gallery-view";
import { SiteShell } from "@/components/site-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse the HUG Photos collection — portraits, weddings, events, lifestyle and commercial photography.",
};

export default function GalleryPage() {
  return (
    <SiteShell>
      <div className="bg-navy text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(255,217,26,0.08),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="container-page relative z-10 flex flex-col items-center py-20 text-center lg:py-28">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-gold">
              Collection
            </span>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Our Photography Gallery
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              Every photograph tells a story. Explore moments captured by HUG
              Photos.
            </p>
          </div>
        </section>

        <section className="container-page py-16 lg:py-24">
          <GalleryView />
        </section>
      </div>
    </SiteShell>
  );
}
