"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveImage } from "@/lib/uploads";

type State = { error?: string; saved?: boolean } | undefined;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function uniqueSlug(name: string, ignoreId?: number) {
  const base = slugify(name) || "product";
  let slug = base;
  for (let i = 2; ; i++) {
    const hit = await db.product.findUnique({ where: { slug } });
    if (!hit || hit.id === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
}

async function parse(f: FormData) {
  const str = (k: string) => String(f.get(k) ?? "").trim();
  const name = str("name");
  const price = Math.round(Number(str("price")));
  const categoryId = Number(str("categoryId"));
  const description = str("description");
  const material = str("material");
  if (material && !(await db.material.findUnique({ where: { name: material } }))) return { error: "Choose a material from the list." } as const;

  if (!name || !description || !material) return { error: "Name, description and material are required." } as const;
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price." } as const;
  if (!(await db.category.findUnique({ where: { id: categoryId } }))) return { error: "Choose a category." } as const;

  let image: string | undefined;
  const file = f.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file);
    if ("error" in saved) return { error: saved.error } as const;
    image = saved.url;
  }

  return {
    data: {
      name,
      price,
      categoryId,
      description,
      material,
      inStock: f.get("inStock") === "on",
      featured: f.get("featured") === "on",
      ...(image ? { image } : {}),
    },
  } as const;
}

function refresh(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function createProduct(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const parsed = await parse(f);
  if ("error" in parsed) return { error: parsed.error };
  await db.product.create({ data: { ...parsed.data, slug: await uniqueSlug(parsed.data.name) } });
  refresh();
  redirect("/admin/products");
}

export async function updateProduct(id: number, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { error: "Product not found." };
  const parsed = await parse(f);
  if ("error" in parsed) return { error: parsed.error };
  // Slug stays fixed so existing links keep working.
  await db.product.update({ where: { id }, data: parsed.data });
  refresh(existing.slug);
  return { saved: true };
}

export async function removeProductImage(id: number) {
  await requireAdmin();
  const p = await db.product.update({ where: { id }, data: { image: null } });
  refresh(p.slug);
  revalidatePath(`/admin/products/${id}`);
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const product = await db.product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } });
  if (!product) return;
  if (product._count.orderItems > 0) {
    // Past orders reference it, so hide it from the shop instead of deleting.
    await db.product.update({ where: { id }, data: { inStock: false, featured: false } });
  } else {
    await db.product.delete({ where: { id } });
  }
  refresh(product.slug);
  redirect("/admin/products");
}

export async function saveSettings(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const fee = Math.round(Number(f.get("deliveryFee")));
  const freeOver = Math.round(Number(f.get("freeDeliveryOver")));
  if (![fee, freeOver].every((n) => Number.isFinite(n) && n >= 0)) return { error: "Enter valid amounts (0 or more)." };
  await db.$transaction([
    db.setting.upsert({ where: { key: "deliveryFee" }, update: { value: String(fee) }, create: { key: "deliveryFee", value: String(fee) } }),
    db.setting.upsert({ where: { key: "freeDeliveryOver" }, update: { value: String(freeOver) }, create: { key: "freeDeliveryOver", value: String(freeOver) } }),
  ]);
  revalidatePath("/", "layout");
  return { saved: true };
}
