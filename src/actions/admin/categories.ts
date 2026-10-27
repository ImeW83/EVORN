"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { CategoryModel, ProductModel, isId } from "@/server/models";
import { deleteImage, uploadImage } from "@/server/services/cloudinary";

type State = { error?: string; saved?: boolean } | undefined;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
}

export async function createCategory(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Enter a category name." };
  await connectDb();
  const base = slugify(name) || "category";
  let slug = base;
  for (let i = 2; await CategoryModel.exists({ slug }); i++) slug = `${base}-${i}`;
  await CategoryModel.create({ name, slug });
  refresh();
  return { saved: true };
}

// The slug stays fixed so existing shop links keep working.
export async function renameCategory(id: string, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Name cannot be empty." };
  if (!isId(id)) return { error: "Category not found." };
  await connectDb();
  await CategoryModel.updateOne({ _id: id }, { name });
  refresh();
  return { saved: true };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- first arg is the previous state from useActionState
export async function deleteCategory(id: string, _prev: State): Promise<State> {
  await requireAdmin();
  if (!isId(id)) return { error: "Category not found." };
  await connectDb();
  const count = await ProductModel.countDocuments({ categoryId: id });
  if (count > 0) return { error: `Move or delete its ${count} product(s) first.` };
  const category = await CategoryModel.findByIdAndDelete(id).lean();
  await deleteImage(category?.image?.publicId);
  refresh();
  return { saved: true };
}

// Replaces the picture shown on the home page tile.
export async function setCategoryImage(id: string, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const file = f.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  if (!isId(id)) return { error: "Category not found." };
  await connectDb();
  const category = await CategoryModel.findById(id);
  if (!category) return { error: "Category not found." };
  const uploaded = await uploadImage(file, "evorn/categories");
  if ("error" in uploaded) return { error: uploaded.error };
  const old = category.image?.publicId;
  category.image = { url: uploaded.url, publicId: uploaded.publicId };
  await category.save();
  await deleteImage(old);
  refresh();
  return { saved: true };
}

export async function removeCategoryImage(id: string) {
  await requireAdmin();
  if (!isId(id)) return;
  await connectDb();
  const category = await CategoryModel.findById(id);
  if (!category?.image) return;
  const old = category.image.publicId;
  category.image = null;
  await category.save();
  await deleteImage(old);
  refresh();
}
