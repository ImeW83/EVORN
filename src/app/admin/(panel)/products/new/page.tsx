import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProduct } from "../../../products";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  await requireAdmin();
  const [categories, materials] = await Promise.all([
    db.category.findMany({ orderBy: { id: "asc" } }),
    db.material.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <Link href="/admin/products" className="text-xs uppercase tracking-[0.2em] text-brown/70 hover:text-brown">← All products</Link>
      <h1 className="mt-4 text-5xl">Add product</h1>
      <ProductForm action={createProduct} categories={categories} materials={materials} submitLabel="Add product" />
    </>
  );
}
