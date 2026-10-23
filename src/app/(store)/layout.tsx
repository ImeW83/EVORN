import { DeliveryProvider } from "@/components/DeliveryProvider";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getDeliverySettings } from "@/lib/settings";

// Reads the database (menu, delivery settings), so never prerender at build time.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const delivery = await getDeliverySettings();
  return (
    <DeliveryProvider value={delivery}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </DeliveryProvider>
  );
}
