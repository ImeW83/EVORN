"use client";

import { useActionState } from "react";
import Image from "next/image";
import { createCategory, deleteCategory, removeCategoryImage, renameCategory, setCategoryImage } from "@/actions/admin/categories";

const field = "border border-line bg-pearl px-4 py-2.5 text-sm outline-none focus:border-brown";
const btn = "bg-brown px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-cream hover:bg-brown-dark disabled:opacity-60";

export function AddCategory() {
  const [state, action, pending] = useActionState(createCategory, undefined);
  return (
    <form action={action} className="mt-6 flex flex-wrap items-center gap-3">
      <input name="name" required placeholder="New category name" aria-label="New category name" className={`${field} w-64`} />
      <button disabled={pending} className={btn}>Add category</button>
      {state?.error && <span role="alert" className="text-sm text-red-700">{state.error}</span>}
    </form>
  );
}

export function CategoryRow({
  id,
  name,
  slug,
  productCount,
  image,
}: {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image: string | null;
}) {
  const [pic, picAction, uploading] = useActionState(setCategoryImage.bind(null, id), undefined);
  const [rename, renameAction, renaming] = useActionState(renameCategory.bind(null, id), undefined);
  const [del, delAction, deleting] = useActionState(deleteCategory.bind(null, id), undefined);
  return (
    <li className="flex flex-wrap items-center gap-4 p-4">
      <form action={renameAction} className="flex flex-wrap items-center gap-3">
        <input name="name" defaultValue={name} required aria-label={`Name for ${name}`} className={`${field} w-56`} />
        <button disabled={renaming} className={btn}>Save</button>
        {rename?.saved && <span role="status" className="text-sm text-green-800">Saved</span>}
        {rename?.error && <span role="alert" className="text-sm text-red-700">{rename.error}</span>}
      </form>
      <span className="text-xs text-brown/60">/{slug} · {productCount} product(s)</span>
      <form action={picAction} className="flex w-full flex-wrap items-center gap-3 sm:order-last">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-line bg-sand">
          {image && <Image src={image} alt="" fill sizes="56px" className="object-cover" />}
        </div>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required
          aria-label={`Home page picture for ${name}`}
          className="max-w-56 text-xs"
        />
        <button disabled={uploading} className={btn}>{image ? "Replace picture" : "Upload picture"}</button>
        {image && (
          <button formAction={removeCategoryImage.bind(null, id)} formNoValidate className="text-xs uppercase tracking-[0.2em] underline">
            Remove
          </button>
        )}
        {pic?.error && <span role="alert" className="text-sm text-red-700">{pic.error}</span>}
        {pic?.saved && <span role="status" className="text-sm text-green-800">Picture saved</span>}
      </form>
      <form action={delAction} className="ml-auto flex items-center gap-3">
        {del?.error && <span role="alert" className="text-sm text-red-700">{del.error}</span>}
        <button
          disabled={deleting}
          onClick={(e) => { if (!confirm(`Delete category “${name}”?`)) e.preventDefault(); }}
          className="text-xs uppercase tracking-[0.2em] text-red-700 underline hover:text-red-900"
        >
          Delete
        </button>
      </form>
    </li>
  );
}
