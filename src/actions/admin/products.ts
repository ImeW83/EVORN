"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { CategoryModel, MaterialModel, OrderModel, ProductModel, isId } from "@/server/models";
import { deleteImage, isOwnProductImage, signProductUpload } from "@/server/services/cloudinary";
import type { ProductImage } from "@/server/types";

type State = { error?: string; saved?: boolean } | undefined;

const MAX_IMAGES = 8;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Signed parameters the admin's browser needs to upload a photo straight to Cloudinary.
export async function getUploadParams() {
  await requireAdmin();
  return signProductUpload();
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "product";
  let slug = base;
  for (let i = 2; ; i++) {
    const hit = await ProductModel.findOne({ slug }).select("_id").lean();
    if (!hit || String(hit._id) === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
}

function parseImages(raw: string): ProductImage[] | null {
  try {
    const list: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(list) || list.length > MAX_IMAGES) return null;
    if (!list.every((i) => i && isOwnProductImage(i))) return null;
    return list.map((i) => ({ url: i.url, publicId: i.publicId }));
  } catch {
    return null;
  }
}

async function parse(f: FormData) {
  const str = (k: string) => String(f.get(k) ?? "").trim();
  const name = str("name");
  const price = Math.round(Number(str("price")));
  const categoryId = str("categoryId");
  const description = str("description");
  const material = str("material");

  if (!name || !description || !material) return { error: "Name, description and material are required." } as const;
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price." } as const;
  if (!isId(categoryId) || !(await CategoryModel.exists({ _id: categoryId }))) return { error: "Choose a category." } as const;
  if (!(await MaterialModel.exists({ name: material }))) return { error: "Choose a material from the list." } as const;

  const images = parseImages(str("images"));
  if (!images) return { error: `Photos could not be read (up to ${MAX_IMAGES} are allowed). Please re-add them.` } as const;

  return {
    data: {
      name,
      price,
      categoryId,
      description,
      material,
      images,
      inStock: f.get("inStock") === "on",
      featured: f.get("featured") === "on",
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
  await connectDb();
  const parsed = await parse(f);
  if ("error" in parsed) return { error: parsed.error };
  await ProductModel.create({ ...parsed.data, slug: await uniqueSlug(parsed.data.name) });
  refresh();
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  await connectDb();
  const existing = isId(id) ? await ProductModel.findById(id) : null;
  if (!existing) return { error: "Product not found." };
  const parsed = await parse(f);
  if ("error" in parsed) return { error: parsed.error };

  const kept = new Set(parsed.data.images.map((i) => i.publicId));
  const removed = (existing.images as ProductImage[]).map((i) => i.publicId).filter((p) => !!p && !kept.has(p));

  // Slug stays fixed so existing links keep working.
  existing.set(parsed.data);
  await existing.save();
  await Promise.all(removed.map((p) => deleteImage(p)));
  refresh(existing.slug);
  return { saved: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  if (!isId(id)) return;
  await connectDb();
  const product = await ProductModel.findById(id);
  if (!product) return;
  if (await OrderModel.exists({ "items.productId": product._id })) {
    // Past orders reference it, so hide it from the shop instead of deleting.
    product.inStock = false;
    product.featured = false;
    await product.save();
  } else {
    await product.deleteOne();
    await Promise.all((product.images as ProductImage[]).map((i) => deleteImage(i.publicId)));
  }
  refresh(product.slug);
  redirect("/admin/products");
}
