interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  const eyebrowTone =
    tone === "dark" ? "text-gold" : "text-ink-muted";
  const titleTone = tone === "dark" ? "text-white" : "text-ink";
  const titleWeight = tone === "dark" ? "font-semibold" : "font-light";
  const descriptionTone =
    tone === "dark" ? "text-mist/80" : "text-ink-soft";

  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      {eyebrow ? (
        <span
          className={`text-xs font-semibold uppercase tracking-[0.28em] ${eyebrowTone}`}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={`mt-4 max-w-2xl text-balance text-3xl leading-tight tracking-tight sm:text-4xl ${titleWeight} ${titleTone}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-5 max-w-xl text-base leading-relaxed ${descriptionTone}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}