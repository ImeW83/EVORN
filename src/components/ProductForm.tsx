"use client";

import { useActionState } from "react";
import { ProductImage } from "@/components/ProductImage";

const field = "w-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brown";
const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80";

type Action = (prev: { error?: string; saved?: boolean } | undefined, f: FormData) => Promise<{ error?: string; saved?: boolean } | undefined>;
type Product = {
  name: string; price: number; categoryId: number; description: string; material: string;
  image: string | null; inStock: boolean; featured: boolean;
};

export function ProductForm({
  action, categories, materials, product, submitLabel,
}: {
  action: Action;
  categories: { id: number; name: string }[];
  materials: { id: number; name: string }[];
  product?: Product;
  submitLabel: string;
}) {
  const [state, run, pending] = useActionState(action, undefined);
  return (
    <form action={run} className="mt-8 max-w-2xl space-y-5">
      <div>
        <label htmlFor="name" className={label}>Name *</label>
        <input id="name" name="name" required defaultValue={product?.name} className={field} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={label}>Price (LKR) *</label>
          <input id="price" name="price" type="number" min={0} step={1} required defaultValue={product?.price} className={field} />
        </div>
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
      <div>
        <label htmlFor="image" className={label}>Photo (JPG, PNG or WebP, max 5 MB)</label>
        {product?.image && <ProductImage src={product.image} alt={product.name} className="mb-3 h-40 w-40" />}
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        {product?.image && <p className="mt-1 text-xs text-brown/60">Choose a file to replace the current photo.</p>}
      </div>
      <div className="flex gap-8 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="inStock" defaultChecked={product?.inStock ?? true} /> In stock</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured on home page</label>
      </div>
      {state?.error && <p role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-green-800">Saved.</p>}
      <button disabled={pending} className="bg-brown px-10 py-3.5 text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark disabled:opacity-60">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
