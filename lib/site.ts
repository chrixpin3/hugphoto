export const site = {
  name: "HUG Photos",
  tagline: "Capturing Moments, Creating Memories.",
  summary: "Professional photography that tells your story.",
  telephone: "+1 (555) 012-3456",
  telephoneHref: "tel:+15550123456",
  email: "hello@hugphotos.com",
  whatsapp: "+1 (555) 012-3456",
  whatsappHref: "https://wa.me/15550123456",
} as const;

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const services = [
  {
    title: "Portrait Photography",
    description:
      "Natural, timeless portraits that capture personality and expression in beautiful light.",
  },
  {
    title: "Wedding Photography",
    description:
      "Documenting your day with elegance and emotion, from the quiet moments to the celebration.",
  },
  {
    title: "Event Photography",
    description:
      "Conferences, celebrations and milestone occasions covered with a calm, unobtrusive eye.",
  },
  {
    title: "Lifestyle Photography",
    description:
      "Relaxed, editorial storytelling for brands, families and personal projects.",
  },
  {
    title: "Commercial Photography",
    description:
      "Clean, considered imagery for products, interiors and campaigns that need to sell an idea.",
  },
] as const;
