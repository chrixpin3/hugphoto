import Link from "next/link";

interface LogoProps {
  className?: string;
  onNavigate?: () => void;
  variant?: "ink" | "navy";
}

export function Logo({
  className = "",
  onNavigate,
  variant = "ink",
}: LogoProps) {
  if (variant === "navy") {
    return (
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="HUG Photos — Home"
        className={`group inline-flex flex-col leading-none ${className}`}
      >
        <span className="text-xl font-bold uppercase leading-none tracking-[0.18em] text-gold transition-opacity duration-300 group-hover:opacity-85">
          HUG
        </span>
        <span className="mt-1.5 text-[0.6rem] font-medium uppercase leading-none tracking-[0.34em] text-white/90 transition-colors duration-300 group-hover:text-gold">
          Photos
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="HUG Photos — Home"
      className={`group inline-flex items-baseline gap-2.5 ${className}`}
    >
      <span className="text-[1.05rem] font-semibold uppercase leading-none tracking-[0.32em] text-ink">
        HUG
      </span>
      <span className="text-[1.05rem] font-light uppercase leading-none tracking-[0.32em] text-ink-muted transition-colors duration-300 group-hover:text-ink">
        Photos
      </span>
    </Link>
  );
}