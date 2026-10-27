"use client";

import Image from "next/image";
import { useActionState } from "react";
import { createSlide, deleteSlide, moveSlide, updateSlide } from "@/actions/admin/slides";
import { SLIDE_LAYOUTS, SLIDE_LAYOUT_LABELS } from "@/lib/config";
import type { HeroSlide } from "@/server/types";

const field = "w-full border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-brown";
const label = "mb-1 block text-[11px] uppercase tracking-[0.2em] text-brown/80";
const btn = "bg-brown px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-cream hover:bg-brown-dark disabled:opacity-60";

function Fields({ slide }: { slide?: HeroSlide }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label}>
          Photo {slide ? "(choose one only to replace it)" : "*"}
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            required={!slide}
            className="mt-1 block w-full text-xs normal-case tracking-normal"
          />
        </label>
        <p className="mt-1 text-xs text-brown/60">Wide photos work best (about 1920 × 1000). JPG, PNG or WebP, up to 3.5 MB.</p>
      </div>
      <label className={`${label} sm:col-span-2`}>
        Caption style
        <select name="layout" defaultValue={slide?.layout ?? "box"} className={`${field} mt-1 normal-case tracking-normal`}>
          {SLIDE_LAYOUTS.map((l) => <option key={l} value={l}>{SLIDE_LAYOUT_LABELS[l]}</option>)}
        </select>
      </label>
      <label className={label}>
        Small line above the title
        <input name="eyebrow" defaultValue={slide?.eyebrow} placeholder="Your Everyday Accessories" className={`${field} mt-1 normal-case tracking-normal`} />
      </label>
      <label className={label}>
        Title *
        <textarea name="title" required rows={2} defaultValue={slide?.title} placeholder={"A gift for\nsomeone special"} className={`${field} mt-1 normal-case tracking-normal`} />
      </label>
      <label className={`${label} sm:col-span-2`}>
        Text under the title
        <input name="subtitle" defaultValue={slide?.subtitle} placeholder="Simple pieces, worn every day." className={`${field} mt-1 normal-case tracking-normal`} />
      </label>
      <label className={label}>
        Button text
        <input name="buttonLabel" defaultValue={slide?.buttonLabel ?? "Shop now"} className={`${field} mt-1 normal-case tracking-normal`} />
      </label>
      <label className={label}>
        Button link
        <input name="buttonLink" defaultValue={slide?.buttonLink ?? "/shop"} placeholder="/shop?category=rings" className={`${field} mt-1 normal-case tracking-normal`} />
      </label>
    </div>
  );
}

export function AddSlide() {
  const [state, action, pending] = useActionState(createSlide, undefined);
  return (
    <form action={action} key={state?.saved ? "saved" : "form"} className="mt-6 max-w-3xl space-y-4 border border-line p-5">
      <h2 className="text-2xl">Add a slide</h2>
      <Fields />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Show on the home page</label>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className={btn}>{pending ? "Uploading…" : "Add slide"}</button>
    </form>
  );
}

export function SlideRow({ slide, first, last }: { slide: HeroSlide; first: boolean; last: boolean }) {
  const [save, saveAction, saving] = useActionState(updateSlide.bind(null, slide.id), undefined);
  const [del, delAction, deleting] = useActionState(deleteSlide.bind(null, slide.id), undefined);
  return (
    <li className="grid gap-5 p-5 md:grid-cols-[220px_1fr]">
      <div>
        <div className="relative aspect-[16/9] overflow-hidden bg-sand">
          <Image src={slide.image.url} alt="" fill sizes="220px" className="object-cover" />
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em]">
          <form action={moveSlide.bind(null, slide.id, -1)}>
            <button disabled={first} className="underline disabled:no-underline disabled:opacity-40">↑ Earlier</button>
          </form>
          <form action={moveSlide.bind(null, slide.id, 1)}>
            <button disabled={last} className="underline disabled:no-underline disabled:opacity-40">↓ Later</button>
          </form>
        </div>
      </div>
      <div>
        <form action={saveAction} className="space-y-4">
          <Fields slide={slide} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={slide.active} /> Show on the home page</label>
          <div className="flex flex-wrap items-center gap-4">
            <button disabled={saving} className={btn}>{saving ? "Saving…" : "Save"}</button>
            {save?.saved && <span role="status" className="text-sm text-green-800">Saved</span>}
            {save?.error && <span role="alert" className="text-sm text-red-700">{save.error}</span>}
          </div>
        </form>
        <form action={delAction} className="mt-3">
          {del?.error && <span role="alert" className="text-sm text-red-700">{del.error}</span>}
          <button
            disabled={deleting}
            onClick={(e) => { if (!confirm("Delete this slide and its photo?")) e.preventDefault(); }}
            className="text-xs uppercase tracking-[0.2em] text-red-700 underline hover:text-red-900"
          >
            Delete slide
          </button>
        </form>
      </div>
    </li>
  );
}
