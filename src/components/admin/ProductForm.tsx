"use client";

import { useActionState, useState } from "react";
import type { OptionGroup } from "@/lib/options";
import { DEFAULT_SECTIONS, SECTIONS, type SectionSlug } from "@/lib/sections";
import type { ProductImage } from "@/server/types";
import { ProductImagesField } from "./ProductImagesField";
import { ProductOptionsField } from "./ProductOptionsField";
import { keepValues } from "@/lib/forms";

const field = "w-full border border-line bg-pearl px-4 py-3 text-sm outline-none focus:border-brown";
const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80";

type Action = (prev: { error?: string; saved?: boolean } | undefined, f: FormData) => Promise<{ error?: string; saved?: boolean } | undefined>;
type Product = {
  name: string; price: number; originalPrice: number | null; categoryId: string; sections: SectionSlug[]; description: string; material: string;
  images: ProductImage[]; options: OptionGroup[]; inStock: boolean; featured: boolean;
};

export function ProductForm({
  action, categories, materials, product, submitLabel,
}: {
  action: Action;
  categories: { id: string; name: string }[];
  materials: { id: string; name: string }[];
  product?: Product;
  submitLabel: string;
}) {
  const [state, run, pending] = useActionState(action, undefined);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  return (
    <form action={run} onSubmit={keepValues(run)} className="mt-8 max-w-2xl space-y-5">
      <div>
        <label htmlFor="name" className={label}>Name *</label>
        <input id="name" name="name" required defaultValue={product?.name} className={field} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={label}>Selling price (LKR) *</label>
          <input id="price" name="price" type="number" min={0} step={1} required defaultValue={product?.price} className={field} />
        </div>
        <div>
          <label htmlFor="originalPrice" className={label}>Original price (LKR), if discounted</label>
          <input id="originalPrice" name="originalPrice" type="number" min={0} step={1} defaultValue={product?.originalPrice ?? undefined} placeholder="Leave empty for no discount" className={field} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className={label}>Section *</legend>
          <div className="flex gap-6 py-3 text-sm">
            {SECTIONS.map((s) => (
              <label key={s.slug} className="flex items-center gap-2">
                <input type="checkbox" name="sections" value={s.slug} defaultChecked={(product?.sections ?? DEFAULT_SECTIONS).includes(s.slug)} />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="categoryId" className={label}>Category *</label>
          <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""} className={field}>
            <option value="" disabled>Choose…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="material" className={label}>Material *</label>
        <select id="material" name="material" required defaultValue={product?.material ?? ""} className={field}>
          <option value="" disabled>Choose…</option>
          {materials.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="description" className={label}>Description *</label>
        <textarea id="description" name="description" rows={4} required defaultValue={product?.description} className={field} />
      </div>
      <ProductImagesField initial={product?.images ?? []} onBusyChange={setUploading} onChange={setImages} />
      <ProductOptionsField initial={product?.options ?? []} images={images} />
      <div className="flex gap-8 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="inStock" defaultChecked={product?.inStock ?? true} /> In stock</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured on home page</label>
      </div>
      {state?.error && <p role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-green-800">Saved.</p>}
      <button disabled={pending || uploading} className="bg-brown px-10 py-3.5 text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark disabled:opacity-60">
        {pending ? "Saving…" : uploading ? "Uploading photos…" : submitLabel}
      </button>
    </form>
  );
}
