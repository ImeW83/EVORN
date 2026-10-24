"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { MaterialModel, ProductModel, isId } from "@/server/models";

type State = { error?: string; saved?: boolean } | undefined;

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/materials");
}

export async function createMaterial(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Enter a material name." };
  await connectDb();
  if (await MaterialModel.exists({ name })) return { error: "That material already exists." };
  await MaterialModel.create({ name });
  refresh();
  return { saved: true };
}

// Products store the material name, so renaming also updates the products using it.
export async function renameMaterial(id: string, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Name cannot be empty." };
  if (!isId(id)) return { error: "Material not found." };
  await connectDb();
  const current = await MaterialModel.findById(id);
  if (!current) return { error: "Material not found." };
  if (current.name === name) return { saved: true };
  if (await MaterialModel.exists({ name })) return { error: "That material already exists." };
  const previous = current.name;
  current.name = name;
  await current.save();
  await ProductModel.updateMany({ material: previous }, { material: name });
  refresh();
  return { saved: true };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- first arg is the previous state from useActionState
export async function deleteMaterial(id: string, _prev: State): Promise<State> {
  await requireAdmin();
  if (!isId(id)) return { saved: true };
  await connectDb();
  const current = await MaterialModel.findById(id);
  if (!current) return { saved: true };
  const count = await ProductModel.countDocuments({ material: current.name });
  if (count > 0) return { error: `Change the material on its ${count} product(s) first.` };
  await current.deleteOne();
  refresh();
  return { saved: true };
}
