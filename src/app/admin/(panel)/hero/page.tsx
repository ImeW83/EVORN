import { IntervalForm, SlideForm, SlideList } from "@/components/admin/HeroAdmin";
import { MAX_HERO_SLIDES } from "@/lib/hero";
import { requireAdmin } from "@/server/auth/admin";
import { getHeroInterval, listAllSlides } from "@/server/services/hero";

export const dynamic = "force-dynamic";

export default async function AdminHero({ searchParams }: PageProps<"/admin/hero">) {
  await requireAdmin();
  const { edit } = await searchParams;
  const [slides, interval] = await Promise.all([listAllSlides(), getHeroInterval()]);
  const editing = typeof edit === "string" ? (slides.find((s) => s.id === edit) ?? null) : null;

  return (
    <>
      <h1 className="text-5xl">Hero</h1>
      <p className="mt-3 max-w-2xl text-sm text-brown/70">
        Photos that play at the top of the home page, in this order, up to {MAX_HERO_SLIDES}. Hidden slides are kept but not
        shown. With no slides shown, the home page uses the EVORN lettering hero.
      </p>
      <IntervalForm seconds={interval} />
      <SlideList slides={slides} editing={editing?.id ?? null} />
      <SlideForm key={editing?.id ?? "new"} slide={editing ?? undefined} full={slides.length >= MAX_HERO_SLIDES} />
    </>
  );
}
