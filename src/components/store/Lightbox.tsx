"use client";

/* eslint-disable @next/next/no-img-element -- Cloudinary already resizes these images (see cloudinaryUrl) */

import { useCallback, useEffect, useRef, useState } from "react";
import { cloudinaryUrl } from "@/lib/product";
import type { ProductImage } from "@/server/types";

type Rect = { left: number; top: number; width: number; height: number };

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

// Full-screen viewer. The photo grows out of the carousel slide that was clicked, the page behind blurs,
// and a click on the photo zooms in with the zoom following the pointer.
export function Lightbox({
  images,
  name,
  index,
  onIndex,
  getOrigin,
  onClose,
}: {
  images: ProductImage[];
  name: string;
  index: number;
  onIndex: (i: number) => void;
  getOrigin: () => Rect | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const flown = useRef(false);
  const swipeStart = useRef<number | null>(null);
  const [flip, setFlip] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      setZoom(null);
      onIndex((index + delta + count) % count);
    },
    [index, count, onIndex],
  );

  // Fly back into the slide, then unmount.
  const close = useCallback(() => {
    if (leaving) return;
    setZoom(null);
    setLeaving(true);
    const img = imgRef.current;
    const origin = getOrigin();
    if (img && origin) {
      const r = img.getBoundingClientRect();
      setFlip(
        `translate(${origin.left + origin.width / 2 - (r.left + r.width / 2)}px, ${origin.top + origin.height / 2 - (r.top + r.height / 2)}px) scale(${origin.width / r.width})`,
      );
    } else {
      setFlip(null);
    }
    window.setTimeout(onClose, 460);
  }, [leaving, getOrigin, onClose]);

  // Keyboard, scroll lock and focus handling.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && count > 1) go(1);
      else if (e.key === "ArrowLeft" && count > 1) go(-1);
      else if (e.key === "Tab") {
        // Keep keyboard focus inside the dialog.
        const items = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, go, count]);

  // The first photo starts at the carousel slide's position and size, then eases into place.
  function onFirstLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (flown.current) return;
    flown.current = true;
    const origin = getOrigin();
    if (origin) {
      const r = e.currentTarget.getBoundingClientRect();
      setFlip(
        `translate(${origin.left + origin.width / 2 - (r.left + r.width / 2)}px, ${origin.top + origin.height / 2 - (r.top + r.height / 2)}px) scale(${origin.width / r.width})`,
      );
    }
    requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
  }

  function moveZoom(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoom || !imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    setZoom({
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null || zoom || count < 2) return;
    const dx = e.clientX - start;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  }

  const shown = entered && !leaving;
  const image = images[index];

  const control =
    "flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-brown-dark/50 text-lg text-cream backdrop-blur transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} photos`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col outline-none"
    >
      <div
        onClick={close}
        className="absolute inset-0 bg-brown-dark/90 backdrop-blur-md motion-reduce:transition-none"
        style={{ opacity: shown ? 1 : 0, transition: "opacity 500ms ease" }}
      />

      <div
        className="relative flex items-center justify-between px-5 py-4 text-cream motion-reduce:transition-none"
        style={{ opacity: shown ? 1 : 0, transition: "opacity 500ms ease 150ms" }}
      >
        <p className="text-xs uppercase tracking-[0.25em]">
          {name} <span className="ml-2 text-cream/60">{index + 1} / {count}</span>
        </p>
        <button type="button" onClick={close} aria-label="Close" className={control}>✕</button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
        onPointerDown={(e) => { swipeStart.current = e.clientX; }}
        onPointerUp={onPointerUp}
        onPointerMove={moveZoom}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div
          className="flex max-h-full max-w-full items-center justify-center motion-reduce:transition-none"
          style={{
            transform: entered && !leaving ? "none" : (flip ?? "scale(0.94)"),
            opacity: flip || entered ? 1 : 0,
            transition: entered || leaving ? `transform ${leaving ? 460 : 700}ms ${EASE}, opacity 400ms ease` : "none",
          }}
        >
          <img
            ref={imgRef}
            key={image.publicId}
            src={cloudinaryUrl(image.url, "c_limit,w_2000,q_auto,f_auto")}
            alt={`${name} — photo ${index + 1} of ${count}`}
            draggable={false}
            onLoad={onFirstLoad}
            onClick={() => setZoom(zoom ? null : { x: 50, y: 50 })}
            className="lb-swap max-h-[calc(100vh-14rem)] max-w-full select-none object-contain shadow-2xl motion-reduce:transition-none sm:max-h-[calc(100vh-12rem)]"
            style={{
              cursor: zoom ? "zoom-out" : "zoom-in",
              transform: zoom ? "scale(2.4)" : "scale(1)",
              transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%",
              transition: zoom ? "transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1)" : `transform 400ms ${EASE}`,
            }}
          />
        </div>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${control} absolute left-3 top-1/2 -translate-y-1/2 sm:left-6`} style={{ opacity: shown ? 1 : 0, transition: "opacity 500ms ease 200ms" }}>←</button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${control} absolute right-3 top-1/2 -translate-y-1/2 sm:right-6`} style={{ opacity: shown ? 1 : 0, transition: "opacity 500ms ease 200ms" }}>→</button>
          </>
        )}
      </div>

      <div
        className="relative flex flex-col items-center gap-3 px-5 pb-5 pt-2"
        style={{ opacity: shown ? 1 : 0, transition: "opacity 500ms ease 250ms" }}
      >
        {count > 1 && (
          <ul className="flex max-w-full gap-2 overflow-x-auto py-1">
            {images.map((im, i) => (
              <li key={im.publicId}>
                <button
                  type="button"
                  onClick={() => { setZoom(null); onIndex(i); }}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={`block h-14 w-12 overflow-hidden border transition ${i === index ? "border-cream opacity-100" : "border-transparent opacity-50 hover:opacity-90"}`}
                >
                  <img src={cloudinaryUrl(im.url, "c_fill,w_100,h_120,q_auto,f_auto")} alt="" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] uppercase tracking-[0.25em] text-cream/60">Click the photo to zoom · move to look around</p>
      </div>
    </div>
  );
}
