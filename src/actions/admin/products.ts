"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { CategoryModel, MaterialModel, OrderModel, ProductModel, isId } from "@/server/models";
import { PRODUCT_FOLDER, deleteImage, isOwnImage, signUpload } from "@/server/services/cloudinary";
import { OPTION_LIMITS, OPTION_NAMES, type OptionGroup } from "@/lib/options";
import { SECTIONS, isSection } from "@/lib/sections";
import type { ProductImage } from "@/server/types";

type State = { error?: string; saved?: boolean } | undefined;

const MAX_IMAGES = 8;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Signed parameters the admin's browser needs to upload a photo straight to Cloudinary.
export async function getUploadParams() {
  await requireAdmin();
  return signUpload(PRODUCT_FOLDER);
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
    if (!list.every((i) => i && isOwnImage(i, PRODUCT_FOLDER))) return null;
    return list.map((i) => ({ url: i.url, publicId: i.publicId }));
  } catch {
    return null;
  }
}

// Option groups arrive as JSON from the options field. Returns an error message or the cleaned groups.
function parseOptions(raw: string, images: ProductImage[]): string | OptionGroup[] {
  let list: unknown;
  try {
    list = JSON.parse(raw || "[]");
  } catch {
    return "Options could not be read. Please check them and save again.";
  }
  if (!Array.isArray(list) || list.length > OPTION_LIMITS.groups) return `A product can have up to ${OPTION_LIMITS.groups} options.`;
  const groups: OptionGroup[] = [];
  for (const g of list) {
    const name = String(g?.name ?? "");
    if (!(OPTION_NAMES as readonly string[]).includes(name)) return `Choose ${OPTION_NAMES.join(", ")} for every option.`;
    if (groups.some((x) => x.name === name)) return `There are two "${name}" options. Use each one once.`;
    const choices = Array.isArray(g?.choices) ? g.choices : [];
    if (choices.length === 0 || choices.length > OPTION_LIMITS.choices) return `"${name}" needs between 1 and ${OPTION_LIMITS.choices} choices.`;
    const clean: OptionGroup["choices"] = [];
    for (const c of choices) {
      const label = String(c?.label ?? "").trim().slice(0, OPTION_LIMITS.label);
      const extra = Math.round(Number(c?.extra ?? 0));
      if (!label) return `Fill in every choice under "${name}".`;
      if (clean.some((x) => x.label.toLowerCase() === label.toLowerCase())) return `"${name}" has "${label}" twice.`;
      if (!Number.isFinite(extra) || extra < 0 || extra > OPTION_LIMITS.extra) return `Enter a valid extra price for "${label}" (0 for none).`;
      // A linked photo must be one of this product's photos; links to removed photos are dropped.
      const image = images.some((i) => i.publicId === c?.image) ? String(c.image) : null;
      clean.push({ label, extra, available: c?.available !== false, image });
    }
    if (!clean.some((c) => c.available)) return `At least one "${name}" choice must be available.`;
    groups.push({ name, choices: clean });
  }
  return groups;
}

async function parse(f: FormData) {
  const str = (k: string) => String(f.get(k) ?? "").trim();
  const name = str("name");
  const price = Math.round(Number(str("price")));
  const original = str("originalPrice") ? Math.round(Number(str("originalPrice"))) : null;
  const categoryId = str("categoryId");
  const description = str("description");
  const material = str("material");

  if (!name || !description || !material) return { error: "Name, description and material are required." } as const;
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price." } as const;
  if (original !== null && !(Number.isFinite(original) && original > price)) {
    return { error: "The original price must be higher than the selling price, or left empty." } as const;
  }
  const sections = SECTIONS.map((s) => s.slug).filter((s) => f.getAll("sections").includes(s));
  if (sections.length === 0 || !sections.every(isSection)) return { error: "Choose Ladies, Men or both." } as const;
  if (!isId(categoryId) || !(await CategoryModel.exists({ _id: categoryId }))) return { error: "Choose a category." } as const;
  if (!(await MaterialModel.exists({ name: material }))) return { error: "Choose a material from the list." } as const;

  const images = parseImages(str("images"));
  if (!images) return { error: `Photos could not be read (up to ${MAX_IMAGES} are allowed). Please re-add them.` } as const;
  const options = parseOptions(str("options"), images);
  if (typeof options === "string") return { error: options } as const;

  return {
    data: {
      name,
      price,
      originalPrice: original,
      categoryId,
      sections,
      description,
      material,
      images,
      options,
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
