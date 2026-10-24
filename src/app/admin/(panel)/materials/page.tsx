import { AddMaterial, MaterialRow } from "@/components/admin/MaterialAdmin";
import { requireAdmin } from "@/server/auth/admin";
import { getMaterialsWithCounts } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function AdminMaterials() {
  await requireAdmin();
  const materials = await getMaterialsWithCounts();
  return (
    <>
      <h1 className="text-5xl">Materials</h1>
      <AddMaterial />
      <ul className="mt-8 divide-y divide-line border border-line">
        {materials.map((m) => (
          <MaterialRow key={m.id} id={m.id} name={m.name} productCount={m.productCount} />
        ))}
        {materials.length === 0 && <li className="p-6 text-center text-brown/70">No materials yet.</li>}
      </ul>
    </>
  );
}
