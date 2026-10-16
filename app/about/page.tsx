import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "About",
  description:
    "HUG Photos is a professional photography studio creating portraits, weddings, events, lifestyle and commercial imagery.",
};

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

const reasons = [
  {
    title: "Creativity",
    description:
      "We look for the angles, light and candid moments that others miss, so every gallery feels personal and alive.",
  },
  {
    title: "Attention to detail",
    description:
      "From the first frame to final delivery, every image is composed and edited with care and consistency.",
  },
  {
    title: "Professionalism",
    description:
      "Clear communication, reliable timelines and a calm, respectful presence throughout your session.",
  },
  {
    title: "Preserving memories",
    description:
      "We create photographs made to be revisited — turning fleeting moments into lasting keepsakes.",
  },
];

export default async function AboutPage() {
  const [recent, settings] = await Promise.all([
    safe(listRecentPhotos(3), [] as PhotoDTO[]),
    getSettingsSafe(),
  ]);

  const galleryImages = [
    {
      src: "/hug.png",
      alt: "HUG Photos photography portfolio",
      width: 322,
      height: 483,
    },
    ...recent.map((photo) => ({
      src: photo.url,
      alt: photo.title || "HUG Photos photograph",
      width: photo.width,
      height: photo.height,
    })),
  ].slice(0, 4);

  return (
    <SiteShell>
      <div className="bg-navy text-white">
        <section className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(255,217,26,0.08),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="container-page relative z-10 py-20 lg:py-28">
            <Reveal>
              <div className="max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-gold">
                  About
                </span>
                <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  About HUG Photos
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
                  HUG Photos captures meaningful moments and turns them into
                  lasting memories. From quiet portraits to once-in-a-lifetime
                  celebrations, we photograph the moments that matter most.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,217,26,0.4)]"
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
                    className="inline-flex items-center gap-3 rounded-full border-2 border-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-gold hover:text-navy"
                  >
                    Book a Session
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-white/10 bg-navy-2">
          <div className="container-page grid gap-14 py-20 lg:grid-cols-2 lg:py-28">
            <Reveal>
              <SectionHeading
                tone="dark"
                eyebrow="Our Story"
                title="Honest photographs that outlast trends."
                description="HUG Photos began with a simple belief: the best photographs are honest ones. We take the time to understand the story behind each moment, then capture it with patience and a calm, unhurried presence."
              />
              <p className="mt-6 max-w-xl text-base leading-relaxed text-mist/80">
                We favour natural light and considered composition over heavy
                processing, so the result feels authentic to the people and
                places in it — and still looks beautiful years from now.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <SectionHeading
                tone="dark"
                eyebrow="Our Mission"
                title="Preserving the moments you never want to forget."
                description="Our mission is to preserve the feelings, details and people that matter to you. Every session is approached with the same commitment — thoughtful composition, beautiful light and images you will treasure for a lifetime."
              />
              <p className="mt-6 max-w-xl text-base leading-relaxed text-mist/80">
                Whether you are planning an intimate portrait session, a
                milestone celebration or a brand campaign, we would be glad to
                be part of it.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="bg-navy">
          <div className="container-page py-20 lg:py-28">
            <Reveal>
              <SectionHeading
                tone="dark"
                align="center"
                eyebrow="Our work"
                title="Photography for every chapter."
                description="A glimpse of the portraits, celebrations and stories we capture."
                className="mx-auto"
              />
            </Reveal>
            <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {galleryImages.map((image, index) => (
                <Reveal key={`${image.src}-${index}`} delay={index * 70}>
                  <Link
                    href="/gallery"
                    aria-label="Open gallery"
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-navy-2 transition-colors duration-300 hover:border-gold/50"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/25" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-navy-2">
          <div className="container-page py-20 lg:py-28">
            <Reveal>
              <SectionHeading
                tone="dark"
                eyebrow="Why Choose HUG Photos?"
                title="Care, craft and a genuine interest in people."
                description="The details that shape every session and every final image."
              />
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map((reason, index) => (
                <Reveal key={reason.title} delay={index * 60}>
                  <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-navy p-7 transition-colors duration-300 hover:border-gold/40">
                    <span className="text-xs font-semibold tracking-[0.24em] text-gold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                      {reason.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist/80">
                      {reason.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy">
          <div className="container-page py-20 lg:py-28">
            <Reveal>
              <SectionHeading
                tone="dark"
                eyebrow="What we do"
                title="Services"
                description="A range of photography services, each delivered with the same care and attention to detail."
              />
            </Reveal>
            <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.title} delay={index * 60}>
                  <div className="border-t border-white/15 pt-6">
                    <h3 className="text-lg font-semibold tracking-tight text-white">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist/80">
                      {service.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-navy-2">
          <div className="container-page py-20 lg:py-28">
            <Reveal>
              <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                <SectionHeading
                  tone="dark"
                  align="center"
                  eyebrow="Ready when you are"
                  title="Let's create something beautiful together."
                  description={`Reach out to ${settings.websiteName} to discuss dates, ideas and availability.`}
                  className="items-center"
                />
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-3 rounded-full border-2 border-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-gold hover:text-navy"
                  >
                    Explore Gallery
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,217,26,0.4)]"
                  >
                    Book a Session
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
