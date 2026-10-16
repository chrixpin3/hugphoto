"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { navigation } from "@/lib/site";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navLinkClass = (itemHref: string) =>
    `relative text-sm tracking-wide transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100 ${
      isActive(pathname, itemHref)
        ? "text-gold after:scale-x-100"
        : "text-white/85 hover:text-gold"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-white/10 transition-colors duration-300 ${
        scrolled
          ? "bg-navy/95 shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-md"
          : "bg-navy"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between gap-6 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Logo variant="navy" onNavigate={() => setOpen(false)} />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={navLinkClass(item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 md:flex md:justify-self-end">
          <Link
            href="/admin/login"
            className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-gold"
          >
            Admin
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(255,217,26,0.35)]"
          >
            Book a Session
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-6 flex-col gap-1.5">
            <span
              className={`h-0.5 w-full bg-white transition-transform duration-300 ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-full bg-gold transition-opacity duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-0.5 w-full bg-white transition-transform duration-300 ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-white/10 bg-navy md:hidden"
      >
        <nav aria-label="Mobile" className="container-page py-6">
          <ul className="flex flex-col gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-base tracking-wide transition-colors ${
                    isActive(pathname, item.href)
                      ? "text-gold"
                      : "text-white/85 hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-navy transition-all duration-300"
          >
            Book a Session
          </Link>
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white/60 transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}