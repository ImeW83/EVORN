import { AddSlide, SlideRow } from "@/components/admin/SlideAdmin";
import { requireAdmin } from "@/server/auth/admin";
import { listSlides } from "@/server/services/slides";

export const dynamic = "force-dynamic";

export default async function AdminSlides() {
  await requireAdmin();
  const slides = await listSlides();
  return (
    <>
      <h1 className="text-5xl">Hero slides</h1>
      <p className="mt-3 max-w-2xl text-sm text-brown/70">
        The photos that rotate at the top of the home page, one every 4 seconds, in the order below. With no slides
        shown, the home page uses the EVORN lettering hero instead.
      </p>
      <AddSlide />
      <ul className="mt-8 max-w-4xl divide-y divide-line border border-line">
        {slides.map((s, i) => (
          <SlideRow key={s.id} slide={s} first={i === 0} last={i === slides.length - 1} />
        ))}
        {slides.length === 0 && <li className="p-6 text-center text-brown/70">No slides yet.</li>}
      </ul>
    </>
  );
}
