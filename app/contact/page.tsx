import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { SiteShell } from "@/components/site-shell";
import { site } from "@/lib/site";
import {
  getSettingsSafe,
  toTelephoneHref,
  toWhatsAppHref,
} from "@/lib/settings";
import type { SocialLinksDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact HUG Photos by telephone, email or WhatsApp to discuss your portrait, wedding, event or commercial photography.",
};

const SOCIAL_LABELS: { key: keyof SocialLinksDTO; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "other", label: "Website" },
];

export default async function ContactPage() {
  const settings = await getSettingsSafe();

  const telephone = settings.telephone.trim() || site.telephone;
  const email = settings.email.trim() || site.email;
  const whatsapp = settings.whatsapp.trim() || site.whatsapp;
  const location = settings.location.trim();
  const whatsappHref = toWhatsAppHref(whatsapp) || site.whatsappHref;

  const channels = [
    {
      label: "Telephone",
      value: telephone,
      href: toTelephoneHref(telephone) || site.telephoneHref,
      external: false,
    },
    {
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      external: false,
    },
    {
      label: "WhatsApp",
      value: whatsapp,
      href: whatsappHref,
      external: true,
    },
  ];

  const socials = SOCIAL_LABELS.map(({ key, label }) => ({
    label,
    href: settings.socials[key].trim(),
  })).filter((social) => social.href);

  return (
    <SiteShell>
      <div className="bg-navy text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(255,217,26,0.08),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="container-page relative z-10 py-20 lg:py-28">
            <Reveal>
              <div className="max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-gold">
                  Contact
                </span>
                <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Let&rsquo;s Capture Something Special
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
                  Whether it is a portrait, a wedding, an event or a commercial
                  project, we would love to hear about it. Send a message below
                  or reach out on WhatsApp to plan your session with HUG Photos.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="container-page py-16 lg:py-24">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.35fr]">
            <Reveal>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                  Get in touch
                </h2>
                <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
                  {channels.map((channel) => (
                    <li key={channel.label}>
                      <a
                        href={channel.href}
                        target={channel.external ? "_blank" : undefined}
                        rel={
                          channel.external ? "noopener noreferrer" : undefined
                        }
                        className="group flex items-center justify-between py-6 transition-colors hover:text-gold"
                      >
                        <span>
                          <span className="block text-xs uppercase tracking-[0.2em] text-mist/60">
                            {channel.label}
                          </span>
                          <span className="mt-2 block text-lg font-medium tracking-tight text-white transition-colors group-hover:text-gold">
                            {channel.value}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-gold transition-transform duration-300 group-hover:translate-x-1"
                        >
                          &rarr;
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                {location ? (
                  <p className="mt-6 text-sm leading-relaxed text-mist/80">
                    <span className="block text-xs uppercase tracking-[0.2em] text-mist/60">
                      Based in
                    </span>
                    <span className="mt-1 block text-white/90">{location}</span>
                  </p>
                ) : null}

                {socials.length > 0 ? (
                  <div className="mt-6">
                    <span className="block text-xs uppercase tracking-[0.2em] text-mist/60">
                      Follow
                    </span>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      {socials.map((social) => (
                        <li key={social.label}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-gold"
                          >
                            {social.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center gap-4 rounded-2xl border border-whatsapp/40 bg-whatsapp/10 p-5 transition-colors duration-300 hover:bg-whatsapp/20"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white">
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.46 0 .13 5.35.13 11.94c0 2.1.55 4.14 1.59 5.95L0 24l6.25-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.58 0 11.93-5.35 11.93-11.94 0-3.19-1.24-6.18-3.45-8.42ZM12.05 21.86a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97 1-3.62-.24-.37a9.87 9.87 0 0 1-1.51-5.26c0-5.46 4.45-9.91 9.91-9.91 2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.9 7.02c0 5.45-4.45 9.9-9.94 9.9Zm5.44-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35Z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Chat on WhatsApp
                    </span>
                    <span className="mt-1 block text-sm text-mist/80">
                      Quickest way to reach us about availability.
                    </span>
                  </span>
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-2xl border border-white/10 bg-navy-2 p-6 sm:p-9">
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Send a message
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mist/80">
                  Fields marked as required must be completed before sending.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
