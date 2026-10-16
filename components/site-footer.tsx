import Link from "next/link";
import { Logo } from "@/components/logo";
import { navigation, site } from "@/lib/site";
import { toTelephoneHref, toWhatsAppHref } from "@/lib/settings";
import type { SiteSettingsDTO, SocialLinksDTO } from "@/lib/types";

const SOCIAL_LABELS: { key: keyof SocialLinksDTO; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "other", label: "Website" },
];

export function SiteFooter({
  settings,
}: {
  settings?: SiteSettingsDTO;
}) {
  const year = new Date().getFullYear();

  const websiteName = settings?.websiteName.trim() || site.name;
  const telephone = settings?.telephone.trim() || site.telephone;
  const email = settings?.email.trim() || site.email;
  const whatsapp = settings?.whatsapp.trim() || site.whatsapp;
  const location = settings?.location.trim() || "";

  const telephoneHref = toTelephoneHref(telephone) || site.telephoneHref;
  const whatsappHref = toWhatsAppHref(whatsapp) || site.whatsappHref;

  const socials = SOCIAL_LABELS.map(({ key, label }) => ({
    label,
    href: settings?.socials?.[key]?.trim() || "",
  })).filter((social) => social.href);

  return (
    <footer className="border-t border-white/10 bg-navy">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="max-w-xs">
            <Logo variant="navy" />
            <p className="mt-5 text-sm leading-relaxed text-mist/80">
              {site.summary} Portraits, weddings, events, lifestyle and
              commercial photography.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold/90">
              Navigate
            </h2>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/75 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold/90">
              Contact
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {telephone ? (
                <li>
                  <a
                    href={telephoneHref}
                    className="transition-colors hover:text-gold"
                  >
                    {telephone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="transition-colors hover:text-gold"
                  >
                    {email}
                  </a>
                </li>
              ) : null}
              {whatsapp && whatsappHref ? (
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-gold"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {location ? <li className="text-white/60">{location}</li> : null}
            </ul>

            {socials.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-gold"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {websiteName}. All rights reserved.
          </p>
          <Link
            href="/admin/login"
            className="font-medium uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-gold"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
