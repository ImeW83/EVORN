import { DeliveryProvider } from "@/components/store/DeliveryProvider";
import { Footer } from "@/components/store/Footer";
import { Navbar } from "@/components/store/Navbar";
import { getDeliverySettings } from "@/server/services/settings";

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
