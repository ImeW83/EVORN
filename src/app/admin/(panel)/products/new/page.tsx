import Link from "next/link";
import { createProduct } from "@/actions/admin/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/server/auth/admin";
import { getCategories, getMaterials } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  await requireAdmin();
  const [categories, materials] = await Promise.all([getCategories(), getMaterials()]);
  return (
    <>
      <Link href="/admin/products" className="text-xs uppercase tracking-[0.2em] text-brown/70 hover:text-brown">← All products</Link>
      <h1 className="mt-4 text-5xl">Add product</h1>
      <ProductForm action={createProduct} categories={categories} materials={materials} submitLabel="Add product" />
    </>
  );
}
