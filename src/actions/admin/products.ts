"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { CategoryModel, MaterialModel, OrderModel, ProductModel, isId } from "@/server/models";
import { deleteImage, uploadProductImage } from "@/server/services/cloudinary";

type State = { error?: string; saved?: boolean } | undefined;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "product";
  let slug = base;
  for (let i = 2; ; i++) {
    const hit = await ProductModel.findOne({ slug }).select("_id").lean();
    if (!hit || String(hit._id) === ignoreId) return slug;
    slug = `${base}-${i}`;
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

  let image: { url: string; publicId: string } | undefined;
  const file = f.get("image");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadProductImage(file);
    if ("error" in uploaded) return { error: uploaded.error } as const;
    image = uploaded;
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
    },
    image,
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
  await ProductModel.create({
    ...parsed.data,
    slug: await uniqueSlug(parsed.data.name),
    ...(parsed.image && { image: parsed.image.url, imagePublicId: parsed.image.publicId }),
  });
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
  const oldImage = existing.imagePublicId;
  // Slug stays fixed so existing links keep working.
  existing.set(parsed.data);
  if (parsed.image) {
    existing.image = parsed.image.url;
    existing.imagePublicId = parsed.image.publicId;
  }
  await existing.save();
  if (parsed.image) await deleteImage(oldImage);
  refresh(existing.slug);
  return { saved: true };
}

export async function removeProductImage(id: string) {
  await requireAdmin();
  if (!isId(id)) return;
  await connectDb();
  const product = await ProductModel.findById(id);
  if (!product) return;
  const old = product.imagePublicId;
  product.image = null;
  product.imagePublicId = null;
  await product.save();
  await deleteImage(old);
  refresh(product.slug);
  revalidatePath(`/admin/products/${id}`);
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
    await deleteImage(product.imagePublicId);
  }
  refresh(product.slug);
  redirect("/admin/products");
}
