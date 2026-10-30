import type { SortOrder } from "mongoose";
import { DEFAULT_SECTIONS, type SectionSlug } from "@/lib/sections";
import { connectDb } from "../db";
import { CategoryModel, MaterialModel, ProductModel, isId } from "../models";
import { plain } from "../serialize";
import type { Category, Material, Product } from "../types";

// Adds the derived `image` (cover url) to a product document.
const plainProduct = (doc: unknown): Product => {
  const p = plain<Omit<Product, "image">>(doc);
  return {
    ...p,
    image: p.images?.[0]?.url ?? null,
    images: p.images ?? [],
    options: p.options ?? [],
    sections: p.sections?.length ? p.sections : DEFAULT_SECTIONS,
    originalPrice: p.originalPrice ?? null,
  };
};

// Mongo filter for products in a section. Products saved before sections existed have none and count as Ladies.
function inSection(section: SectionSlug): Record<string, unknown> {
  return section === "ladies"
    ? { $or: [{ sections: "ladies" }, { sections: { $exists: false } }, { sections: { $size: 0 } }] }
    : { sections: section };
}
const plainProducts = (docs: unknown[]) => docs.map(plainProduct);

export type ProductWithCategory = Product & { category: Category };

export const SORTS: Record<string, { label: string; sort: Record<string, SortOrder> }> = {
  newest: { label: "Newest", sort: { createdAt: -1 } },
  "price-asc": { label: "Price: low to high", sort: { price: 1 } },
  "price-desc": { label: "Price: high to low", sort: { price: -1 } },
  name: { label: "Name A–Z", sort: { name: 1 } },
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function getCategories() {
  await connectDb();
  return plain<Category[]>(await CategoryModel.find().sort({ _id: 1 }).lean());
}

export async function getCategoriesWithCounts() {
  await connectDb();
  const [categories, counts] = await Promise.all([
    getCategories(),
    ProductModel.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$categoryId", n: { $sum: 1 } } }]),
  ]);
  const countOf = (id: string) => counts.find((c) => String(c._id) === id)?.n ?? 0;
  return categories.map((c) => ({ ...c, productCount: countOf(c.id) }));
}

// Categories that have at least one product in the section, for the shop menu and the shop page.
export async function getCategoriesInSection(section: SectionSlug) {
  await connectDb();
  const [categories, used] = await Promise.all([getCategories(), ProductModel.distinct("categoryId", inSection(section))]);
  const ids = new Set(used.map(String));
  return categories.filter((c) => ids.has(c.id));
}

// Cover photo for each section's home page tile: the newest product in that section that has a photo.
export async function getSectionCovers(): Promise<Record<SectionSlug, string | null>> {
  await connectDb();
  const cover = async (section: SectionSlug) => {
    const p = await ProductModel.findOne({ ...inSection(section), "images.0": { $exists: true } }).sort({ createdAt: -1 }).lean();
    return p?.images?.[0]?.url ?? null;
  };
  const [ladies, men] = await Promise.all([cover("ladies"), cover("men")]);
  return { ladies, men };
}

export async function getMaterials() {
  await connectDb();
  return plain<Material[]>(await MaterialModel.find().sort({ name: 1 }).lean());
}

export async function getMaterialsWithCounts() {
  await connectDb();
  const [materials, counts] = await Promise.all([
    getMaterials(),
    ProductModel.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$material", n: { $sum: 1 } } }]),
  ]);
  return materials.map((m) => ({ ...m, productCount: counts.find((c) => c._id === m.name)?.n ?? 0 }));
}

// Materials that at least one product uses (for the shop filter).
export async function getUsedMaterials() {
  await connectDb();
  return ((await ProductModel.distinct("material")) as string[]).sort();
}

export async function getFeaturedProducts(limit = 8) {
  await connectDb();
  return plainProducts(await ProductModel.find({ featured: true }).sort({ createdAt: -1 }).limit(limit).lean());
}

export type ProductFilters = { section?: SectionSlug; category?: string; material?: string; q?: string; min?: number; max?: number; sort?: string };

export async function searchProducts(f: ProductFilters) {
  await connectDb();
  const query: Record<string, unknown> = {};
  const and: Record<string, unknown>[] = [];
  if (f.section) and.push(inSection(f.section));
  if (f.category) {
    const cat = await CategoryModel.findOne({ slug: f.category }).lean();
    query.categoryId = cat?._id ?? null;
  }
  if (f.material) query.material = f.material;
  if (f.q) {
    const rx = new RegExp(escapeRegex(f.q), "i");
    and.push({ $or: [{ name: rx }, { description: rx }] });
  }
  if (and.length) query.$and = and;
  if (f.min || f.max) query.price = { ...(f.min && { $gte: f.min }), ...(f.max && { $lte: f.max }) };
  const sort = (SORTS[f.sort ?? ""] ?? SORTS.newest).sort;
  return plainProducts(await ProductModel.find(query).sort(sort).lean());
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  await connectDb();
  const product = await ProductModel.findOne({ slug }).lean();
  if (!product) return null;
  const category = await CategoryModel.findById(product.categoryId).lean();
  if (!category) return null;
  return { ...plainProduct(product), category: plain<Category>(category) };
}

// Same category and sharing a section, so a men's ring suggests other men's rings.
export async function getRelatedProducts(categoryId: string, excludeId: string, sections: SectionSlug[], limit = 4) {
  await connectDb();
  return plainProducts(
    await ProductModel.find({ categoryId, _id: { $ne: excludeId }, $or: sections.map((s) => inSection(s)) }).limit(limit).lean(),
  );
}

// Admin

export async function listProductsWithCategory(): Promise<ProductWithCategory[]> {
  await connectDb();
  const [products, categories] = await Promise.all([
    ProductModel.find().sort({ createdAt: -1 }).lean(),
    getCategories(),
  ]);
  return plainProducts(products).flatMap((p) => {
    const category = categories.find((c) => c.id === p.categoryId);
    return category ? [{ ...p, category }] : [];
  });
}

export async function getProductById(id: string) {
  if (!isId(id)) return null;
  await connectDb();
  const product = await ProductModel.findById(id).lean();
  return product ? plainProduct(product) : null;
}
