"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

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
  const base = slugify(name) || "category";
  let slug = base;
  for (let i = 2; await db.category.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  await db.category.create({ data: { name, slug } });
  refresh();
  return { saved: true };
}

// The slug stays fixed so existing shop links keep working.
export async function renameCategory(id: number, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Name cannot be empty." };
  await db.category.update({ where: { id }, data: { name } });
  refresh();
  return { saved: true };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- first arg is the previous state from useActionState
export async function deleteCategory(id: number, _prev: State): Promise<State> {
  await requireAdmin();
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) return { error: `Move or delete its ${count} product(s) first.` };
  await db.category.delete({ where: { id } });
  refresh();
  return { saved: true };
}
