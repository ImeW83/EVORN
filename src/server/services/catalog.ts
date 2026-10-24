import type { SortOrder } from "mongoose";
import { connectDb } from "../db";
import { CategoryModel, MaterialModel, ProductModel, isId } from "../models";
import { plain } from "../serialize";
import type { Category, Material, Product } from "../types";

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
  return plain<Product[]>(await ProductModel.find({ featured: true }).sort({ createdAt: -1 }).limit(limit).lean());
}

export type ProductFilters = { category?: string; material?: string; q?: string; min?: number; max?: number; sort?: string };

export async function searchProducts(f: ProductFilters) {
  await connectDb();
  const query: Record<string, unknown> = {};
  if (f.category) {
    const cat = await CategoryModel.findOne({ slug: f.category }).lean();
    query.categoryId = cat?._id ?? null;
  }
  if (f.material) query.material = f.material;
  if (f.q) {
    const rx = new RegExp(escapeRegex(f.q), "i");
    query.$or = [{ name: rx }, { description: rx }];
  }
  if (f.min || f.max) query.price = { ...(f.min && { $gte: f.min }), ...(f.max && { $lte: f.max }) };
  const sort = (SORTS[f.sort ?? ""] ?? SORTS.newest).sort;
  return plain<Product[]>(await ProductModel.find(query).sort(sort).lean());
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  await connectDb();
  const product = await ProductModel.findOne({ slug }).lean();
  if (!product) return null;
  const category = await CategoryModel.findById(product.categoryId).lean();
  if (!category) return null;
  return { ...plain<Product>(product), category: plain<Category>(category) };
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  await connectDb();
  return plain<Product[]>(await ProductModel.find({ categoryId, _id: { $ne: excludeId } }).limit(limit).lean());
}

// Admin

export async function listProductsWithCategory(): Promise<ProductWithCategory[]> {
  await connectDb();
  const [products, categories] = await Promise.all([
    ProductModel.find().sort({ createdAt: -1 }).lean(),
    getCategories(),
  ]);
  return plain<Product[]>(products).flatMap((p) => {
    const category = categories.find((c) => c.id === p.categoryId);
    return category ? [{ ...p, category }] : [];
  });
}

export async function getProductById(id: string) {
  if (!isId(id)) return null;
  await connectDb();
  const product = await ProductModel.findById(id).lean();
  return product ? plain<Product>(product) : null;
}
