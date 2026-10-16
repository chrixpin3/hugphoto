import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SiteShell } from "@/components/site-shell";
import { listRecentPhotos } from "@/lib/photos";
import { services } from "@/lib/site";
import { getSettingsSafe } from "@/lib/settings";
import type { PhotoDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [recent, settings] = await Promise.all([
    safe(listRecentPhotos(8), [] as PhotoDTO[]),
    getSettingsSafe(),
  ]);
  const previewPhotos = recent.slice(0, 3);

  return (
    <SiteShell>
      <div className="bg-navy text-white">
        <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden py-24">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div
            className="animate-fade-in absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(255,217,26,0.08),transparent_60%)]"
            aria-hidden="true"
          />

          <div className="container-page relative z-10 flex flex-col items-center text-center">
            <span
              className="animate-fade-up text-xs font-semibold uppercase tracking-[0.4em] text-gold"
              style={{ animationDelay: "0ms" }}
            >
              Professional Photography
            </span>

            <h1
              className="animate-fade-up mt-7 max-w-5xl text-balance text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "120ms" }}
            >
              Your <span className="text-gold">Moments.</span> Our{" "}
              <span className="text-gold">Passion.</span>
            </h1>

            <p
              className="animate-fade-up mt-7 max-w-2xl text-base leading-relaxed text-mist sm:text-lg"
              style={{ animationDelay: "240ms" }}
            >
              Professional photography that captures your story, preserves your
              memories, and turns special moments into timeless images.
            </p>

            <div
              className="animate-fade-up mt-11 flex flex-wrap items-center justify-center gap-4"
              style={{ animationDelay: "360ms" }}
            >
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 rounded-full bg-gold px-9 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,217,26,0.4)]"
              >
                Explore Gallery
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-full border-2 border-gold px-9 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-gold hover:text-navy"
              >
                Book a Session
              </Link>
            </div>

            <div
              className="animate-fade-up mt-20 flex w-full max-w-2xl flex-col items-center"
              style={{ animationDelay: "480ms" }}
            >
              <div className="-rotate-2 rounded-2xl border border-gold/20 bg-gold px-8 py-6 text-center text-navy shadow-[0_18px_44px_-16px_rgba(255,217,26,0.45)] transition-transform duration-300 hover:rotate-0 sm:px-12 sm:py-8">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-navy/70">
                  {settings.websiteName}
                </p>
                <p className="mt-3 text-xl font-bold uppercase leading-tight tracking-[0.08em] sm:text-2xl">
                  Capture the Moment
                </p>
                <p className="mt-2 text-sm font-medium text-navy/75">
                  Memories that last forever
                </p>
              </div>

              {previewPhotos.length > 0 ? (
                <div className="mt-8 grid w-full grid-cols-3 gap-3 sm:gap-4">
                  {previewPhotos.map((photo) => (
                    <Link
                      key={photo.id}
                      href="/gallery"
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-navy-2"
                      aria-label="Open gallery"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.title || "HUG Photos photograph"}
                        fill
                        sizes="(max-width: 640px) 33vw, 24vw"
                        className="object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                      />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-navy-2">
          <div className="container-page py-24 lg:py-28">
            <Reveal>
              <SectionHeading
                tone="dark"
                eyebrow="Services"
                title="Photography for every chapter."
                description="From intimate portraits to full-scale commercial productions, every service is delivered with the same care and attention to detail."
              />
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.title} delay={index * 60}>
                  <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-navy p-8 transition-colors duration-300 hover:border-gold/40">
                    <span className="text-xs font-semibold tracking-[0.24em] text-gold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist/80">
                      {service.description}
                    </p>
                  </article>
                </Reveal>
              ))}
              <Reveal delay={services.length * 60}>
                <article className="flex h-full flex-col justify-between rounded-2xl border border-gold/30 bg-gold p-8 text-navy">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">
                      Have a different project in mind?
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy/80">
                      Tell us what you are planning and we will craft a package
                      around it.
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-navy underline-offset-4 transition-colors hover:underline"
                  >
                    Start a conversation
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-navy">
          <div className="container-page py-24 lg:py-28">
            <Reveal>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading
                  tone="dark"
                  eyebrow="Recent work"
                  title="Photographs from the collection."
                />
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold transition-opacity hover:opacity-80"
                >
                  View full gallery <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </Reveal>

            {recent.length > 0 ? (
              <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {recent.slice(0, 8).map((photo, index) => (
                  <Reveal key={photo.id} delay={(index % 4) * 70}>
                    <Link
                      href="/gallery"
                      className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-navy-2"
                      aria-label="Open gallery"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.title || "Recent photograph"}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </Link>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <p className="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-mist/70">
                  Photographs will appear here as soon as they are published to
                  the gallery.
                </p>
              </Reveal>
            )}
          </div>
        </section>

        <section className="border-t border-white/10 bg-navy-2">
          <div className="container-page py-24 lg:py-28">
            <Reveal>
              <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                <SectionHeading
                  tone="dark"
                  align="center"
                  eyebrow="Ready when you are"
                  title="Let's create something beautiful together."
                  description="Reach out to discuss dates, ideas and availability. We reply to every enquiry personally."
                />
                <Link
                  href="/contact"
                  className="mt-10 inline-flex items-center gap-3 rounded-full bg-gold px-9 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,217,26,0.4)]"
                >
                  Book a Session
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}