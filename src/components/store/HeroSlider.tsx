"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { STORE } from "@/lib/config";
import { cloudinaryUrl } from "@/lib/product";
import type { HeroSlide } from "@/server/types";

const INTERVAL = 4000;

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const photo = (url: string, width = 2400) => cloudinaryUrl(url, `c_limit,w_${width},q_auto,f_auto`);

// Full-width photo slider. Each slide uses its own caption style (box, bottom, split or frame).
// Moves on every 4 seconds; pauses while hovered or focused, and does not move by itself for
// visitors who ask for reduced motion.
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const still = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const count = slides.length;
  const go = (n: number) => setIndex((n + count) % count);

  useEffect(() => {
    if (count < 2 || paused || still) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearTimeout(timer);
  }, [index, paused, still, count]);

  const running = count > 1 && !paused && !still;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[78vh] min-h-[560px] max-h-[820px] overflow-hidden bg-brown text-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 className="sr-only">{STORE.name}: {STORE.tagline}</h1>
      {slides.map((s, i) => {
        const active = i === index;
        const upNext = [1, 2].map((n) => slides[(i + n) % count]).filter((n) => count > 2 || n.id !== s.id).slice(0, count - 1);
        return (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={!active}
            inert={!active}
            className={`absolute inset-0 transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`}
          >
            {s.layout === "split" ? (
              <Split slide={s} active={active} upNext={upNext} onPick={(id) => go(slides.findIndex((x) => x.id === id))} />
            ) : (
              <>
                <Image
                  src={photo(s.image.url)}
                  alt=""
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className={`object-cover transition-transform duration-[6000ms] ease-out ${active ? "scale-105" : "scale-100"}`}
                />
                {s.layout === "box" && <Box slide={s} />}
                {s.layout === "bottom" && <Bottom slide={s} index={i} count={count} active={active} running={running} />}
                {s.layout === "frame" && <Frame slide={s} />}
              </>
            )}
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/60 bg-brown-dark/20 text-2xl transition hover:bg-cream hover:text-brown-dark md:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/60 bg-brown-dark/20 text-2xl transition hover:bg-cream hover:text-brown-dark md:flex"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className="flex h-6 items-center"
              >
                <span className={`block h-1 transition-all duration-500 ${i === index ? "w-9 bg-gold" : "w-4 bg-cream/60"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Eyebrow({ text, className = "" }: { text: string; className?: string }) {
  return text ? <p className={`text-[11px] uppercase tracking-[0.4em] text-gold ${className}`}>{text}</p> : null;
}

function Button({ slide, className }: { slide: HeroSlide; className: string }) {
  return (
    <Link href={slide.buttonLink} className={`inline-block px-8 py-4 text-xs uppercase tracking-[0.25em] transition ${className}`}>
      {slide.buttonLabel}
    </Link>
  );
}

// S1: see-through brown box on the right.
function Box({ slide }: { slide: HeroSlide }) {
  return (
    <>
      <div className="absolute inset-0 bg-brown-dark/15" />
      <div className="absolute inset-x-4 bottom-14 bg-brown-dark/75 p-7 sm:inset-x-auto sm:right-8 sm:w-[520px] md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:p-12 lg:right-20 lg:w-[580px]">
        {slide.eyebrow && <p className="font-display text-xl italic text-gold md:text-2xl">{slide.eyebrow}</p>}
        <h2 className="mt-3 whitespace-pre-line text-4xl font-normal uppercase leading-[1.02] tracking-[0.02em] md:text-6xl">{slide.title}</h2>
        {slide.subtitle && <p className="mt-4 text-sm text-cream/85 md:text-base">{slide.subtitle}</p>}
        <Button slide={slide} className="mt-7 bg-cream text-brown-dark hover:bg-gold" />
      </div>
    </>
  );
}

// S2: large caption on a dark band along the bottom, with a counter and progress lines.
function Bottom({ slide, index, count, active, running }: { slide: HeroSlide; index: number; count: number; active: boolean; running: boolean }) {
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-brown-dark/60 md:h-[55%]" />
      <div className="absolute inset-x-5 bottom-16 md:left-16 md:right-auto md:max-w-3xl">
        <Eyebrow text={slide.eyebrow ? `✦ ${slide.eyebrow}` : ""} />
        <h2 className="mt-4 whitespace-pre-line text-5xl font-light leading-[0.95] md:text-7xl lg:text-8xl">{slide.title}</h2>
        {slide.subtitle && <p className="mt-4 text-sm text-cream/85 md:text-base">{slide.subtitle}</p>}
        <Button slide={slide} className="mt-7 bg-gold text-brown-dark hover:bg-cream" />
      </div>
      <div className="absolute bottom-16 right-16 hidden w-64 lg:block">
        <p className="font-display text-right text-4xl">
          {String(index + 1).padStart(2, "0")} <span className="text-xl text-cream/70">/ {String(count).padStart(2, "0")}</span>
        </p>
        <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
          {Array.from({ length: count }, (_, n) => (
            <span key={n} className="h-0.5 overflow-hidden bg-cream/35">
              <span
                className={`block h-full bg-gold ${n === index && active && running ? "hero-progress" : ""}`}
                style={{ width: n < index || (n === index && !running) ? "100%" : n === index ? undefined : "0%" }}
              />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// S3: brown text panel beside the photo, with the next slides as small previews.
function Split({ slide, active, upNext, onPick }: { slide: HeroSlide; active: boolean; upNext: HeroSlide[]; onPick: (id: string) => void }) {
  return (
    <div className="grid h-full grid-rows-[45%_1fr] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1">
      <div className="relative order-first overflow-hidden md:order-last">
        <Image
          src={photo(slide.image.url, 1600)}
          alt=""
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          className={`object-cover transition-transform duration-[6000ms] ease-out ${active ? "scale-105" : "scale-100"}`}
        />
      </div>
      <div className="flex flex-col bg-brown px-6 pb-14 pt-8 md:px-14 md:pb-16 md:pt-16">
        <Eyebrow text={slide.eyebrow} />
        <h2 className="mt-4 whitespace-pre-line text-4xl font-light leading-none md:text-6xl">{slide.title}</h2>
        {slide.subtitle && <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/85 md:text-base">{slide.subtitle}</p>}
        <div className="mt-6">
          <Button slide={slide} className="bg-gold text-brown-dark hover:bg-cream" />
        </div>
        {upNext.length > 0 && (
          <div className="mt-auto hidden pt-8 md:block">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cream/70">Up next</p>
            <div className="mt-3 flex gap-3">
              {upNext.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onPick(n.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 border border-cream/20 p-2 text-left text-sm transition hover:border-gold"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-sand">
                    <Image src={photo(n.image.url, 200)} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="truncate">{n.title.split("\n")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// S4: text centred inside a thin double gold frame, with a small diamond on top.
function Frame({ slide }: { slide: HeroSlide }) {
  return (
    <>
      <div className="absolute inset-0 bg-brown-dark/50" />
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="flex w-full max-w-2xl flex-col items-center border border-gold px-6 py-10 text-center outline outline-1 outline-offset-[10px] outline-gold/50 md:px-12 md:py-14">
          <svg aria-hidden viewBox="0 0 60 40" className="h-7 w-10 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M30 38 6 12l8-10h32l8 10-24 26Z" />
            <path d="M6 12h48M14 2l16 10 16-10M30 12v26" />
          </svg>
          <Eyebrow text={slide.eyebrow} className="mt-4" />
          <h2 className="mt-4 whitespace-pre-line text-4xl font-light leading-none md:text-7xl">{slide.title}</h2>
          {slide.subtitle && <p className="mt-4 text-sm text-cream/85 md:text-base">{slide.subtitle}</p>}
          <Button slide={slide} className="mt-7 border border-cream hover:bg-cream hover:text-brown-dark" />
        </div>
      </div>
    </>
  );
}
