import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct, removeProductImage, updateProduct } from "@/actions/admin/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/server/auth/admin";
import { getCategories, getMaterials, getProductById } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories, materials] = await Promise.all([getProductById(id), getCategories(), getMaterials()]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="text-xs uppercase tracking-[0.2em] text-brown/70 hover:text-brown">← All products</Link>
      <h1 className="mt-4 text-5xl">{product.name}</h1>
      <ProductForm action={updateProduct.bind(null, product.id)} categories={categories} materials={materials} product={product} submitLabel="Save changes" />

      <div className="mt-10 flex max-w-2xl flex-wrap gap-6 border-t border-line pt-6 text-xs uppercase tracking-[0.2em]">
        {product.image && (
          <form action={removeProductImage.bind(null, product.id)}>
            <button className="underline hover:text-brown/70">Remove photo</button>
          </form>
        )}
        <form action={deleteProduct.bind(null, product.id)}>
          <button className="text-red-700 underline hover:text-red-900">Delete product</button>
        </form>
      </div>
      <p className="mt-2 max-w-2xl text-xs text-brown/60">
        Products that appear in past orders cannot be erased; deleting one marks it sold out and unfeatured instead.
      </p>
    </>
  );
}
