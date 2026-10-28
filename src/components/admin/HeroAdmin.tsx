"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { deleteSlide, getHeroUploadParams, moveSlide, saveInterval, saveSlide, setSlideActive } from "@/actions/admin/hero";
import { HeroSlideView } from "@/components/hero/HeroSlideView";
import { heroFonts } from "@/components/hero/fonts";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { IMAGE_TYPES } from "@/lib/config";
import {
  HERO_BUTTON_THEMES,
  HERO_FOCUS,
  HERO_INTERVAL,
  HERO_LABELS,
  HERO_LIMITS,
  HERO_SIZES,
  HERO_STYLES,
  HERO_X,
  HERO_Y,
  type HeroImage,
  type HeroSlide,
  type HeroSlideContent,
} from "@/lib/hero";

const field = "w-full border border-line bg-pearl px-3 py-2.5 text-sm outline-none focus:border-brown";
const label = "mb-1 block text-[11px] uppercase tracking-[0.2em] text-brown/80";
const btn = "bg-brown px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-cream hover:bg-brown-dark disabled:opacity-60";
const MAX_BYTES = 10 * 1024 * 1024;

export function IntervalForm({ seconds }: { seconds: number }) {
  const [state, action, pending] = useActionState(saveInterval, undefined);
  return (
    <form action={action} className="mt-6 flex flex-wrap items-end gap-3">
      <label className={label}>
        Seconds per slide
        <input
          name="interval"
          type="number"
          min={HERO_INTERVAL.min}
          max={HERO_INTERVAL.max}
          step={1}
          defaultValue={seconds}
          className={`${field} mt-1 w-28 normal-case tracking-normal`}
        />
      </label>
      <button disabled={pending} className={btn}>Save</button>
      {state?.saved && <span role="status" className="text-sm text-green-800">Saved</span>}
      {state?.error && <span role="alert" className="text-sm text-red-700">{state.error}</span>}
    </form>
  );
}

export function SlideList({ slides, editing }: { slides: HeroSlide[]; editing: string | null }) {
  if (slides.length === 0) return <p className="mt-6 border border-line p-6 text-center text-brown/70">No slides yet, so the home page shows the lettering hero.</p>;
  return (
    <ul className="mt-6 divide-y divide-line border border-line">
      {slides.map((s, i) => (
        <li key={s.id} className={`flex flex-wrap items-center gap-4 p-4 ${editing === s.id ? "bg-sand/60" : ""}`}>
          <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-sand">
            <Image src={s.image.url} alt="" fill sizes="112px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{s.headline}</p>
            <p className="text-xs text-brown/60">{HERO_LABELS.style[s.headlineStyle]} · {s.active ? "Shown" : "Hidden"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em]">
            <form action={setSlideActive.bind(null, s.id, !s.active)}>
              <button className="underline">{s.active ? "Hide" : "Show"}</button>
            </form>
            <form action={moveSlide.bind(null, s.id, -1)}>
              <button disabled={i === 0} aria-label={`Move “${s.headline}” earlier`} className="underline disabled:no-underline disabled:opacity-40">↑</button>
            </form>
            <form action={moveSlide.bind(null, s.id, 1)}>
              <button disabled={i === slides.length - 1} aria-label={`Move “${s.headline}” later`} className="underline disabled:no-underline disabled:opacity-40">↓</button>
            </form>
            <Link href={`/admin/hero?edit=${s.id}`} className="underline">Edit</Link>
            <form action={deleteSlide.bind(null, s.id)}>
              <button
                onClick={(e) => { if (!confirm(`Delete the slide “${s.headline}” and its photos? This cannot be undone.`)) e.preventDefault(); }}
                className="text-red-700 underline"
              >
                Delete
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ImageField({ name, title, hint, value, onChange, optional }: {
  name: string; title: string; hint: string; value: HeroImage | null; onChange: (img: HeroImage | null) => void; optional?: boolean;
}) {
  const [status, setStatus] = useState("");
  async function pickFile(file: File | undefined) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return setStatus("Use a JPG, PNG or WebP file.");
    if (file.size > MAX_BYTES) return setStatus("That file is larger than 10 MB.");
    setStatus("Uploading…");
    try {
      const params = await getHeroUploadParams();
      if (!params) return setStatus("Image storage is not configured.");
      onChange(await uploadToCloudinary(file, params));
      setStatus("");
    } catch {
      setStatus("Upload failed. Please try again.");
    }
  }
  return (
    <div>
      <span className={label}>{title}</span>
      <input type="hidden" name={name} value={value ? JSON.stringify(value) : ""} />
      <div className="flex flex-wrap items-center gap-3">
        {value && (
          <span className="relative h-14 w-20 overflow-hidden bg-sand">
            <Image src={value.url} alt="" fill sizes="80px" className="object-cover" />
          </span>
        )}
        <input type="file" accept={IMAGE_TYPES.join(",")} aria-label={title} onChange={(e) => pickFile(e.target.files?.[0])} className="text-xs" />
        {optional && value && (
          <button type="button" onClick={() => onChange(null)} className="text-xs uppercase tracking-[0.2em] underline">Remove</button>
        )}
      </div>
      <p className="mt-1 text-xs text-brown/60">{hint}</p>
      {status && <p role="status" className="mt-1 text-sm text-brown">{status}</p>}
    </div>
  );
}

// Renders its child at a real screen size (e.g. 1280 × 720) and scales it down to the available width.
function ScaledFrame({ width, height, children }: { width: number; height: number; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ height: height * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

const BLANK: Omit<HeroSlideContent, "image"> & { image: HeroImage | null } = {
  image: null,
  mobileImage: null,
  alt: "",
  headline: "",
  subtext: "",
  headlineStyle: "serif",
  headlineColor: "#ffffff",
  textX: "left",
  textY: "middle",
  textSize: "lg",
  focus: "center",
  button: { show: true, label: "Shop now", href: "/shop", theme: "light" },
};

function Select<T extends string>({ name, title, options, labels, value, onChange }: {
  name: string; title: string; options: readonly T[]; labels: Record<T, string>; value: T; onChange: (v: T) => void;
}) {
  return (
    <label className={label}>
      {title}
      <select name={name} value={value} onChange={(e) => onChange(e.target.value as T)} className={`${field} mt-1 normal-case tracking-normal`}>
        {options.map((o) => <option key={o} value={o}>{labels[o]}</option>)}
      </select>
    </label>
  );
}

export function SlideForm({ slide, full }: { slide?: HeroSlide; full: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveSlide.bind(null, slide?.id ?? null), undefined);
  const [v, setV] = useState(slide ?? BLANK);
  const [active, setActive] = useState(slide?.active ?? true);
  const [phone, setPhone] = useState(false);
  const set = <K extends keyof typeof v>(k: K, value: (typeof v)[K]) => setV((old) => ({ ...old, [k]: value }));
  const setButton = (patch: Partial<HeroSlideContent["button"]>) => setV((old) => ({ ...old, button: { ...old.button, ...patch } }));

  // After saving, go back to the list (and a blank form for the next slide).
  useEffect(() => {
    if (state?.saved) router.push("/admin/hero");
  }, [state, router]);

  if (!slide && full) return <p className="mt-6 text-sm text-brown/70">You have reached the limit of 8 slides. Delete one to add another.</p>;

  const preview = v.image ? { ...v, image: v.image, headline: v.headline || "Your headline" } : null;

  return (
    <form action={action} className="mt-6 grid gap-8 border border-line p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-5">
        <h2 className="text-2xl">{slide ? "Edit slide" : "Add a slide"}</h2>
        <ImageField name="image" title="Desktop photo *" hint="2400 × 1350 (16:9). JPG or WebP under 10 MB." value={v.image} onChange={(img) => set("image", img)} />
        <ImageField name="mobileImage" title="Phone photo (optional)" hint="1080 × 1350 (4:5). Without one, phones show the desktop photo cropped around the focus." value={v.mobileImage} onChange={(img) => set("mobileImage", img)} optional />
        <label className={label}>
          Photo description for screen readers
          <input name="alt" maxLength={HERO_LIMITS.alt} value={v.alt} onChange={(e) => set("alt", e.target.value)} placeholder="Gold pendant with coloured stones on a cream tray" className={`${field} mt-1 normal-case tracking-normal`} />
        </label>
        <Select name="focus" title="Keep this part of the photo in view" options={HERO_FOCUS} labels={HERO_LABELS.focus} value={v.focus} onChange={(x) => set("focus", x)} />

        <label className={label}>
          Headline * ({v.headline.length}/{HERO_LIMITS.headline})
          <input name="headline" required maxLength={HERO_LIMITS.headline} value={v.headline} onChange={(e) => set("headline", e.target.value)} className={`${field} mt-1 normal-case tracking-normal`} />
        </label>
        <label className={label}>
          Text under the headline ({v.subtext.length}/{HERO_LIMITS.subtext})
          <input name="subtext" maxLength={HERO_LIMITS.subtext} value={v.subtext} onChange={(e) => set("subtext", e.target.value)} className={`${field} mt-1 normal-case tracking-normal`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select name="headlineStyle" title="Headline style" options={HERO_STYLES} labels={HERO_LABELS.style} value={v.headlineStyle} onChange={(x) => set("headlineStyle", x)} />
          <label className={label}>
            Headline colour
            <span className="mt-1 flex gap-2">
              <input type="color" name="headlineColor" value={v.headlineColor} onChange={(e) => set("headlineColor", e.target.value)} className="h-10 w-14 border border-line bg-pearl" />
              <span className="self-center font-mono text-xs normal-case tracking-normal">{v.headlineColor}</span>
            </span>
          </label>
          <Select name="textX" title="Across" options={HERO_X} labels={HERO_LABELS.x} value={v.textX} onChange={(x) => set("textX", x)} />
          <Select name="textY" title="Up and down" options={HERO_Y} labels={HERO_LABELS.y} value={v.textY} onChange={(x) => set("textY", x)} />
          <Select name="textSize" title="Size" options={HERO_SIZES} labels={HERO_LABELS.size} value={v.textSize} onChange={(x) => set("textSize", x)} />
        </div>

        <fieldset className="space-y-4 border border-line p-4">
          <legend className="px-1 text-[11px] uppercase tracking-[0.2em] text-brown/80">Button</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="buttonShow" checked={v.button.show} onChange={(e) => setButton({ show: e.target.checked })} /> Show a button
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Button text
              <input name="buttonLabel" maxLength={HERO_LIMITS.buttonLabel} value={v.button.label} onChange={(e) => setButton({ label: e.target.value })} className={`${field} mt-1 normal-case tracking-normal`} />
            </label>
            <label className={label}>
              Button link
              <input name="buttonHref" value={v.button.href} onChange={(e) => setButton({ href: e.target.value })} placeholder="/shop?category=rings" className={`${field} mt-1 normal-case tracking-normal`} />
            </label>
            <Select name="buttonTheme" title="Button colour" options={HERO_BUTTON_THEMES} labels={HERO_LABELS.theme} value={v.button.theme} onChange={(x) => setButton({ theme: x })} />
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" checked={active} onChange={(e) => setActive(e.target.checked)} /> Show on the home page
        </label>
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <div className="flex items-center gap-4">
          <button disabled={pending || !v.image} className={btn}>{pending ? "Saving…" : slide ? "Save changes" : "Add slide"}</button>
          {slide && <Link href="/admin/hero" className="text-xs uppercase tracking-[0.2em] underline">Cancel</Link>}
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="mb-2 flex items-center justify-between">
          <span className={label}>Live preview</span>
          <div className="flex gap-3 text-[11px] uppercase tracking-[0.2em]">
            <button type="button" onClick={() => setPhone(false)} aria-pressed={!phone} className={phone ? "opacity-50" : "underline"}>Desktop</button>
            <button type="button" onClick={() => setPhone(true)} aria-pressed={phone} className={phone ? "underline" : "opacity-50"}>Phone</button>
          </div>
        </div>
        <div className={phone ? "mx-auto w-64" : "w-full"}>
          <ScaledFrame key={phone ? "phone" : "desktop"} width={phone ? 390 : 1280} height={phone ? 735 : 720}>
            <div className={`${heroFonts} @container pointer-events-none relative h-full w-full overflow-hidden bg-brown-dark`}>
              {preview ? (
                <HeroSlideView slide={phone && preview.mobileImage ? { ...preview, image: preview.mobileImage } : preview} loading="eager" />
              ) : (
                <p className="flex h-full items-center justify-center p-6 text-center text-2xl text-cream/70">Upload a desktop photo to see the preview.</p>
              )}
            </div>
          </ScaledFrame>
        </div>
        <p className="mt-2 text-xs text-brown/60">
          Drawn at {phone ? "phone size (390 px wide)" : "laptop size (1280 × 720)"} with the same component as the home page.
        </p>
      </div>
    </form>
  );
}
