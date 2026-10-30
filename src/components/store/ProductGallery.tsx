"use client";

/* eslint-disable @next/next/no-img-element -- Cloudinary already resizes these images (see cloudinaryUrl) */

import { useCallback, useRef, useState } from "react";
import { cloudinaryUrl } from "@/lib/product";
import type { ProductImage as Img } from "@/server/types";
import { Lightbox } from "./Lightbox";
import { ProductImage } from "./ProductImage";

// Shortest signed distance from the active slide, so the carousel wraps around.
function offsetOf(i: number, active: number, n: number) {
  let d = i - active;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

// Depth carousel: the active photo sits in front, its neighbours recede to the sides, angled and dimmed.
// Pass `active` and `onActive` to control which photo is shown from outside (e.g. when a colour is picked).
export function ProductGallery({
  images, name, active: activeProp, onActive,
}: { images: Img[]; name: string; active?: number; onActive?: (i: number) => void }) {
  const [own, setOwn] = useState(0);
  const active = activeProp ?? own;
  const setActive = onActive ?? setOwn;
  const [open, setOpen] = useState(false);
  const slides = useRef<(HTMLButtonElement | null)[]>([]);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);
  const n = images.length;

  const go = useCallback((delta: number) => setActive((active + delta + n) % n), [active, n, setActive]);

  // Where the viewer's opening/closing animation starts and ends.
  const getOrigin = useCallback(() => {
    const el = slides.current[active];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, [active]);

  if (n === 0) return <ProductImage src={null} alt={name} className="aspect-[4/5]" />;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  }

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          dragStart.current = e.clientX;
          dragged.current = false;
        }}
        onPointerUp={(e) => {
          const start = dragStart.current;
          dragStart.current = null;
          if (start === null || n < 2) return;
          const dx = e.clientX - start;
          if (Math.abs(dx) > 40) {
            dragged.current = true;
            go(dx < 0 ? 1 : -1);
          }
        }}
        className="relative aspect-square w-full touch-pan-y select-none overflow-hidden bg-sand outline-none [perspective:1400px] focus-visible:ring-2 focus-visible:ring-brown"
      >
        {images.map((img, i) => {
          const o = offsetOf(i, active, n);
          const a = Math.abs(o);
          const hidden = a > 2;
          return (
            <button
              key={img.publicId}
              ref={(el) => {
                slides.current[i] = el;
              }}
              type="button"
              tabIndex={a === 0 ? 0 : -1}
              aria-label={a === 0 ? `Enlarge photo ${i + 1} of ${n}` : `Show photo ${i + 1} of ${n}`}
              aria-hidden={hidden || undefined}
              onClick={() => {
                if (dragged.current) return;
                if (a === 0) setOpen(true);
                else setActive(i);
              }}
              className="absolute left-1/2 top-1/2 aspect-[4/5] w-[58%] overflow-hidden bg-sand shadow-[0_18px_40px_-12px_rgba(40,25,15,0.45)] transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:transition-none"
              style={{
                transform: `translate(-50%, -50%) translateX(${o * 54}%) translateZ(${-a * 150}px) rotateY(${-o * 32}deg) scale(${1 - a * 0.05})`,
                opacity: hidden ? 0 : 1 - a * 0.28,
                filter: `brightness(${1 - a * 0.2})`,
                zIndex: 10 - a,
                pointerEvents: hidden ? "none" : "auto",
                cursor: a === 0 ? "zoom-in" : "pointer",
              }}
            >
              <img
                src={cloudinaryUrl(img.url, "c_fill,ar_4:5,w_900,q_auto,f_auto")}
                alt={a === 0 ? `${name} — photo ${i + 1}` : ""}
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-pearl/90 text-brown shadow transition hover:bg-brown hover:text-cream">←</button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-pearl/90 text-brown shadow transition hover:bg-brown hover:text-cream">→</button>
          </>
        )}
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 bg-pearl/85 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-brown">
          Click to enlarge
        </p>
      </div>

      {n > 1 && (
        <ul className="mt-3 flex justify-center gap-2" aria-label="Choose a photo">
          {images.map((img, i) => (
            <li key={img.publicId}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={`block h-16 w-14 overflow-hidden border transition ${i === active ? "border-brown" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={cloudinaryUrl(img.url, "c_fill,w_120,h_150,q_auto,f_auto")} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <Lightbox images={images} name={name} index={active} onIndex={setActive} getOrigin={getOrigin} onClose={() => setOpen(false)} />}
    </div>
  );
}
