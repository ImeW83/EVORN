"use server";

import { revalidatePath } from "next/cache";
import { SLIDE_LAYOUTS, type SlideLayout } from "@/lib/config";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { HeroSlideModel, isId } from "@/server/models";
import { deleteImage, uploadImage } from "@/server/services/cloudinary";

type State = { error?: string; saved?: boolean } | undefined;

function parse(f: FormData) {
  const str = (k: string) => String(f.get(k) ?? "").trim();
  const title = str("title");
  const buttonLink = str("buttonLink") || "/shop";
  const layout = str("layout") as SlideLayout;
  if (!title) return { error: "Add a title." } as const;
  // Only links inside the store, so a slide can never send customers to another site.
  if (!buttonLink.startsWith("/") || buttonLink.startsWith("//")) return { error: "The button link must start with /, e.g. /shop?category=rings" } as const;
  if (!SLIDE_LAYOUTS.includes(layout)) return { error: "Choose a caption style." } as const;
  return {
    data: {
      title,
      layout,
      eyebrow: str("eyebrow"),
      subtitle: str("subtitle"),
      buttonLabel: str("buttonLabel") || "Shop now",
      buttonLink,
      active: f.get("active") === "on",
    },
  } as const;
}

function file(f: FormData) {
  const image = f.get("image");
  return image instanceof File && image.size > 0 ? image : null;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/slides");
}

export async function createSlide(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const parsed = parse(f);
  if ("error" in parsed) return { error: parsed.error };
  const image = file(f);
  if (!image) return { error: "Choose a photo for the slide." };
  const uploaded = await uploadImage(image, "evorn/hero");
  if ("error" in uploaded) return { error: uploaded.error };
  await connectDb();
  const last = await HeroSlideModel.findOne().sort({ order: -1 }).select("order").lean();
  await HeroSlideModel.create({ ...parsed.data, image: uploaded, order: (last?.order ?? 0) + 1 });
  refresh();
  return { saved: true };
}

export async function updateSlide(id: string, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  if (!isId(id)) return { error: "Slide not found." };
  const parsed = parse(f);
  if ("error" in parsed) return { error: parsed.error };
  await connectDb();
  const slide = await HeroSlideModel.findById(id);
  if (!slide) return { error: "Slide not found." };
  const image = file(f);
  let old: string | undefined;
  if (image) {
    const uploaded = await uploadImage(image, "evorn/hero");
    if ("error" in uploaded) return { error: uploaded.error };
    old = slide.image?.publicId ?? undefined;
    slide.image = uploaded;
  }
  slide.set(parsed.data);
  await slide.save();
  await deleteImage(old);
  refresh();
  return { saved: true };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- first arg is the previous state from useActionState
export async function deleteSlide(id: string, _prev: State): Promise<State> {
  await requireAdmin();
  if (!isId(id)) return { saved: true };
  await connectDb();
  const slide = await HeroSlideModel.findByIdAndDelete(id).lean();
  await deleteImage(slide?.image?.publicId);
  refresh();
  return { saved: true };
}

// Swaps the slide with its neighbour so it shows earlier (-1) or later (+1).
export async function moveSlide(id: string, direction: -1 | 1) {
  await requireAdmin();
  if (!isId(id)) return;
  await connectDb();
  const slides = await HeroSlideModel.find().sort({ order: 1, _id: 1 }).select("_id").lean();
  const i = slides.findIndex((s) => String(s._id) === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= slides.length) return;
  [slides[i], slides[j]] = [slides[j], slides[i]];
  await HeroSlideModel.bulkWrite(slides.map((s, n) => ({ updateOne: { filter: { _id: s._id }, update: { $set: { order: n + 1 } } } })));
  refresh();
}
