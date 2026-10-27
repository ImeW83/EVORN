import type { HeroSlide } from "@/lib/hero";
import { connectDb } from "../db";
import { HeroSlideModel } from "../models";
import { plain } from "../serialize";

export { getHeroInterval } from "./settings";

const list = async (filter: Record<string, unknown>) => {
  await connectDb();
  return plain<HeroSlide[]>(await HeroSlideModel.find(filter).sort({ sortOrder: 1, _id: 1 }).lean());
};

// Slides shown on the home page, in order.
export const getActiveSlides = () => list({ active: true });

// Admin: every slide, shown or not.
export const listAllSlides = () => list({});
