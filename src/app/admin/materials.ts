"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

type State = { error?: string; saved?: boolean } | undefined;

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/materials");
}

export async function createMaterial(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Enter a material name." };
  if (await db.material.findUnique({ where: { name } })) return { error: "That material already exists." };
  await db.material.create({ data: { name } });
  refresh();
  return { saved: true };
}

// Products store the material name, so renaming also updates the products using it.
export async function renameMaterial(id: number, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  if (!name) return { error: "Name cannot be empty." };
  const current = await db.material.findUnique({ where: { id } });
  if (!current) return { error: "Material not found." };
  if (current.name === name) return { saved: true };
  if (await db.material.findUnique({ where: { name } })) return { error: "That material already exists." };
  await db.$transaction([
    db.material.update({ where: { id }, data: { name } }),
    db.product.updateMany({ where: { material: current.name }, data: { material: name } }),
  ]);
  refresh();
  return { saved: true };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- first arg is the previous state from useActionState
export async function deleteMaterial(id: number, _prev: State): Promise<State> {
  await requireAdmin();
  const current = await db.material.findUnique({ where: { id } });
  if (!current) return { saved: true };
  const count = await db.product.count({ where: { material: current.name } });
  if (count > 0) return { error: `Change the material on its ${count} product(s) first.` };
  await db.material.delete({ where: { id } });
  refresh();
  return { saved: true };
}
