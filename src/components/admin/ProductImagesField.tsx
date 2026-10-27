"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { getUploadParams } from "@/actions/admin/products";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { IMAGE_TYPES } from "@/lib/config";
import type { ProductImage } from "@/server/types";

const MAX_IMAGES = 8;
const MAX_BYTES = 10 * 1024 * 1024;

type Tile = { key: string; url?: string; publicId?: string; error?: string };

// Photos upload straight from the browser to Cloudinary; the form only submits the resulting list as JSON.
export function ProductImagesField({
  initial,
  onBusyChange,
}: {
  initial: ProductImage[];
  onBusyChange: (busy: boolean) => void;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tiles, setTiles] = useState<Tile[]>(() => initial.map((i) => ({ key: i.publicId, ...i })));
  const [message, setMessage] = useState("");
  const pending = useRef(0);

  const done = tiles.filter((t): t is Tile & ProductImage => !!t.url && !!t.publicId);

  const setBusy = (delta: number) => {
    pending.current += delta;
    onBusyChange(pending.current > 0);
  };

  const patch = (key: string, change: Partial<Tile>) =>
    setTiles((all) => all.map((t) => (t.key === key ? { ...t, ...change } : t)));

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setMessage("");
    const room = MAX_IMAGES - tiles.length;
    const chosen = Array.from(files).slice(0, Math.max(room, 0));
    if (files.length > room) setMessage(`You can add up to ${MAX_IMAGES} photos.`);
    if (!chosen.length) return;

    const added = chosen.map(() => ({ key: `new-${crypto.randomUUID()}` }));
    setTiles((all) => [...all, ...added]);
    setBusy(1);
    try {
      const params = await getUploadParams();
      await Promise.all(
        chosen.map(async (file, i) => {
          const key = added[i].key;
          if (!params) return patch(key, { error: "Image storage is not configured." });
          if (!IMAGE_TYPES.includes(file.type)) return patch(key, { error: "Use a JPG, PNG or WebP file." });
          if (file.size > MAX_BYTES) return patch(key, { error: "Larger than 10 MB." });
          try {
            const { url, publicId } = await uploadToCloudinary(file, params);
            patch(key, { url, publicId });
          } catch {
            patch(key, { error: "Upload failed. Remove and try again." });
          }
        }),
      );
    } finally {
      setBusy(-1);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const move = (index: number, to: number) =>
    setTiles((all) => {
      if (to < 0 || to >= all.length) return all;
      const next = [...all];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });

  const remove = (key: string) => setTiles((all) => all.filter((t) => t.key !== key));

  const small = "h-8 w-8 border border-line bg-cream text-sm hover:bg-sand disabled:opacity-40";

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80">
        Photos (up to {MAX_IMAGES}; the first is the cover)
      </label>
      <input type="hidden" name="images" value={JSON.stringify(done.map(({ url, publicId }) => ({ url, publicId })))} />

      {tiles.length > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t, i) => (
            <li key={t.key} className="border border-line bg-sand/50 p-2">
              <div className="relative aspect-square overflow-hidden bg-sand">
                {t.url ? (
                  <Image src={t.url} alt={`Photo ${i + 1}`} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-xs text-brown/70">
                    {t.error ?? "Uploading…"}
                  </div>
                )}
                {i === 0 && t.url && (
                  <span className="absolute left-1 top-1 bg-brown px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-cream">Cover</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, i - 1)} className={small}>←</button>
                <button type="button" aria-label="Move later" disabled={i === tiles.length - 1} onClick={() => move(i, i + 1)} className={small}>→</button>
                <button type="button" aria-label="Remove photo" onClick={() => remove(t.key)} className={`${small} text-red-700`}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        multiple
        accept={IMAGE_TYPES.join(",")}
        disabled={tiles.length >= MAX_IMAGES}
        onChange={(e) => addFiles(e.target.files)}
        className="text-sm"
      />
      <p className="mt-1 text-xs text-brown/60">JPG, PNG or WebP, up to 10 MB each. Changes are saved when you press the save button.</p>
      {message && <p role="alert" className="mt-1 text-sm text-red-700">{message}</p>}
    </div>
  );
}
