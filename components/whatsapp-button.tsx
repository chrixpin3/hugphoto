import { site } from "@/lib/site";
import { toWhatsAppDigits } from "@/lib/settings";

interface WhatsAppButtonProps {
  whatsapp?: string;
  websiteName?: string;
}

function resolveWhatsAppNumber(settingsNumber?: string): string | null {
  const fromSettings = settingsNumber?.trim();
  if (fromSettings) {
    const digits = toWhatsAppDigits(fromSettings);
    if (digits) return digits;
  }

  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (fromEnv) {
    const digits = fromEnv.replace(/\D/g, "");
    if (digits) return digits;
  }

  try {
    const url = new URL(site.whatsappHref);
    const digits = url.pathname.replace(/\//g, "").replace(/\D/g, "");
    if (digits) return digits;
  } catch {
    return null;
  }

  return null;
}

export function WhatsAppButton({
  whatsapp,
  websiteName,
}: WhatsAppButtonProps) {
  const number = resolveWhatsAppNumber(whatsapp);
  if (!number) return null;

  const name = websiteName?.trim() || site.name;
  const message = `Hello ${name}, I would like to book a photography session.`;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Contact ${name} on WhatsApp`}
      title={`Chat with ${name} on WhatsApp`}
      className="bg-whatsapp shadow-whatsapp fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform duration-300 motion-safe:hover:scale-110 motion-safe:active:scale-95 sm:bottom-6 sm:right-6 sm:h-[60px] sm:w-[60px]"
    >
      <svg
        viewBox="0 0 24 24"
        width="30"
        height="30"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.46 0 .13 5.35.13 11.94c0 2.1.55 4.14 1.59 5.95L0 24l6.25-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.58 0 11.93-5.35 11.93-11.94 0-3.19-1.24-6.18-3.45-8.42ZM12.05 21.86a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97 1-3.62-.24-.37a9.87 9.87 0 0 1-1.51-5.26c0-5.46 4.45-9.91 9.91-9.91 2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.9 7.02c0 5.45-4.45 9.9-9.94 9.9Zm5.44-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
