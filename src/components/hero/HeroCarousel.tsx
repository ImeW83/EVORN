"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { preload } from "react-dom";
import { STORE } from "@/lib/config";
import type { HeroSlide } from "@/lib/hero";
import { HeroSlideView } from "./HeroSlideView";
import { heroFonts } from "./fonts";

const TRANSITION_MS = 600;
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// Home page hero: slides change every `interval` seconds, looping. Pauses on hover, focus and hidden tabs;
// swipe left/right on touch screens. Reduced motion: plain cross-fade and no autoplay.
export function HeroCarousel({ slides, interval }: { slides: HeroSlide[]; interval: number }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const touchX = useRef<number | null>(null);

  const go = (to: number, direction: 1 | -1) => {
    const next = (to + count) % count;
    if (next === index) return;
    setDir(direction);
    setLeaving(index);
    setIndex(next);
  };

  // Autoplay.
  useEffect(() => {
    if (count < 2 || hovered || focused || hidden || reduced) return;
    const t = setTimeout(() => {
      setDir(1);
      setLeaving(index);
      setIndex((index + 1) % count);
    }, interval * 1000);
    return () => clearTimeout(t);
  }, [index, count, interval, hovered, focused, hidden, reduced]);

  // End of a transition: the old slide is put away (and will-change goes with it).
  useEffect(() => {
    if (leaving === null) return;
    const t = setTimeout(() => setLeaving(null), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Start fetching the next slide's photo so it is ready when it slides in.
  useEffect(() => {
    if (count < 2) return;
    const next = slides[(index + 1) % count];
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const img = phone && next.mobileImage ? next.mobileImage : next.image;
    const { props } = getImageProps({ alt: "", src: img.url, fill: true, sizes: "100vw" });
    if (props.srcSet) preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: "100vw", fetchPriority: "low" });
  }, [index, count, slides]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className={`${heroFonts} @container relative h-[calc(100svh-7rem)] min-h-[480px] overflow-hidden bg-brown-dark md:h-[calc(100svh-4.25rem)]`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }}
    >
      <h1 className="sr-only">{STORE.name}: {STORE.tagline}</h1>
      {slides.map((s, i) => {
        const state = i === index ? (leaving !== null ? "enter" : "current") : i === leaving ? "leave" : "idle";
        return (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            inert={i !== index}
            className={`hero-slide is-${state} ${dir === 1 ? "go-next" : "go-prev"}`}
          >
            <HeroSlideView slide={s} loading={i === 0 ? "eager" : "lazy"} priority={i === 0} />
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-1 z-10 flex justify-center gap-1">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i, i > index ? 1 : -1)}
              className="flex h-8 w-6 items-center justify-center"
            >
              <span className={`block h-1.5 w-1.5 rounded-full transition ${i === index ? "bg-white" : "bg-white/45"}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
