import { AddMaterial, MaterialRow } from "@/components/MaterialAdmin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminMaterials() {
  await requireAdmin();
  const [materials, counts] = await Promise.all([
    db.material.findMany({ orderBy: { name: "asc" } }),
    db.product.groupBy({ by: ["material"], _count: true }),
  ]);
  const countOf = (name: string) => counts.find((c) => c.material === name)?._count ?? 0;
  return (
    <>
      <h1 className="text-5xl">Materials</h1>
      <AddMaterial />
      <ul className="mt-8 divide-y divide-line border border-line">
        {materials.map((m) => (
          <MaterialRow key={m.id} id={m.id} name={m.name} productCount={countOf(m.name)} />
        ))}
        {materials.length === 0 && <li className="p-6 text-center text-brown/70">No materials yet.</li>}
      </ul>
    </>
  );
}
