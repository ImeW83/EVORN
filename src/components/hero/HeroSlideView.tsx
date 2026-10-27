import { getImageProps } from "next/image";
import Link from "next/link";
import type { HeroFocus, HeroSize, HeroSlideContent, HeroStyle, HeroX, HeroY } from "@/lib/hero";

const FOCUS: Record<HeroFocus, string> = { left: "0% 50%", center: "50% 50%", right: "100% 50%" };

// clamp() keeps every size inside the hero; cqw follows the hero's own width (it is a size container),
// so the admin preview scales exactly like the home page. Script letters run small, so they get a boost.
const SIZE: Record<HeroSize, string> = {
  sm: "clamp(1.75rem, 4cqw, 2.75rem)",
  md: "clamp(2.25rem, 5.5cqw, 4rem)",
  lg: "clamp(2.5rem, 7cqw, 5.5rem)",
  xl: "clamp(2.75rem, 9cqw, 7.5rem)",
};
const STYLE: Record<HeroStyle, { className: string; scale: number }> = {
  script: { className: "font-[family-name:var(--font-hero-script)] normal-case leading-[1.15]", scale: 1.35 },
  serif: { className: "font-[family-name:var(--font-hero-serif)] font-medium uppercase leading-[1.02] tracking-[0.02em]", scale: 1 },
  bold: { className: "font-[family-name:var(--font-hero-bold)] font-semibold uppercase leading-[0.95] tracking-[0.01em]", scale: 1 },
};
const X: Record<HeroX, string> = { left: "justify-start text-left sm:pl-[8%]", center: "justify-center text-center", right: "justify-end text-right sm:pr-[8%]" };
const Y: Record<HeroY, string> = { upper: "items-start", middle: "items-center", lower: "items-end" };

// Light text gets a soft dark shadow so it stays readable on pale photos; dark text is left clean.
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
}

// One hero slide: photo, headline and optional button. The photo is a <picture> (phone and desktop crops)
// built from getImageProps, so it still goes through the Next.js image optimiser.
// Used by the home page carousel and the admin live preview; the parent must be a size container (@container).
export function HeroSlideView({ slide, loading = "lazy", priority = false }: { slide: HeroSlideContent; loading?: "eager" | "lazy"; priority?: boolean }) {
  const common = { alt: slide.alt, fill: true, sizes: "100vw" } as const;
  const { props: desktop } = getImageProps({ ...common, src: slide.image.url, loading, fetchPriority: priority ? "high" : undefined });
  const mobile = slide.mobileImage ? getImageProps({ ...common, src: slide.mobileImage.url }).props.srcSet : null;
  const style = STYLE[slide.headlineStyle];
  const external = slide.button.href.startsWith("https://");
  const buttonClass = `pointer-events-auto absolute bottom-[9%] left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center px-7 text-[11px] font-medium uppercase tracking-[0.3em] transition-colors ${
    slide.button.theme === "light" ? "bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white" : "bg-brown-dark text-cream hover:bg-cream hover:text-brown-dark"
  }`;

  return (
    <>
      <div className="hero-photo absolute inset-0 overflow-hidden bg-brown-dark">
        <picture>
          {mobile && <source media="(max-width: 767px)" srcSet={mobile} sizes="100vw" />}
          <img {...desktop} alt={slide.alt} className="object-cover" style={{ ...desktop.style, objectPosition: FOCUS[slide.focus] }} />
        </picture>
      </div>
      <div className="hero-text pointer-events-none absolute inset-0">
        {/* The text sits between 10% from the top and just above the button, so the two never overlap. */}
        <div className={`absolute inset-x-0 top-[10%] bottom-[calc(9%+4.5rem)] flex px-6 sm:px-10 ${X[slide.textX]} ${Y[slide.textY]}`}>
          <div
            className={`max-w-[min(100%,46rem)] [overflow-wrap:anywhere] ${isLight(slide.headlineColor) ? "[text-shadow:0_2px_16px_rgb(0_0_0/0.35)]" : ""}`}
            style={{ color: slide.headlineColor }}
          >
            <p className={style.className} style={{ fontSize: `calc(${SIZE[slide.textSize]} * ${style.scale})` }}>
              {slide.headline}
            </p>
            {slide.subtext && <p className="mt-4 text-sm md:text-lg">{slide.subtext}</p>}
          </div>
        </div>
        {slide.button.show &&
          (external ? (
            <a href={slide.button.href} rel="noopener" className={buttonClass}>{slide.button.label}</a>
          ) : (
            <Link href={slide.button.href} className={buttonClass}>{slide.button.label}</Link>
          ))}
      </div>
    </>
  );
}
