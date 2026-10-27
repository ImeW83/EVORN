import { connectDb } from "../db";
import { HeroSlideModel } from "../models";
import { plain } from "../serialize";
import type { HeroSlide } from "../types";

export async function listSlides({ activeOnly = false } = {}) {
  await connectDb();
  const slides = plain<HeroSlide[]>(await HeroSlideModel.find(activeOnly ? { active: true } : {}).sort({ order: 1, _id: 1 }).lean());
  return slides.map((s) => ({ ...s, layout: s.layout ?? "box" }));
}
