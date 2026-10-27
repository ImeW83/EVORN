"use server";

import { revalidatePath } from "next/cache";
import {
  HERO_BUTTON_THEMES,
  HERO_FOCUS,
  HERO_INTERVAL,
  HERO_LIMITS,
  HERO_SIZES,
  HERO_STYLES,
  HERO_X,
  HERO_Y,
  HEX_COLOR,
  MAX_HERO_SLIDES,
  type HeroImage,
  type HeroSlideContent,
} from "@/lib/hero";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { HeroSlideModel, isId } from "@/server/models";
import { HERO_FOLDER, deleteImage, isOwnImage, signUpload } from "@/server/services/cloudinary";
import { saveHeroInterval } from "@/server/services/settings";

type State = { error?: string; saved?: boolean } | undefined;

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

// Signed parameters for uploading a hero photo from the admin's browser straight to Cloudinary.
export async function getHeroUploadParams() {
  await requireAdmin();
  return signUpload(HERO_FOLDER);
}

const pick = <T extends string>(allowed: readonly T[], value: string): T | null =>
  (allowed as readonly string[]).includes(value) ? (value as T) : null;

// Same-site paths ("/shop", not "//evil.com") or https links only: never javascript:, data: or the like.
function isSafeHref(href: string) {
  return (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")) || /^https:\/\/[^\s/]+\.[^\s]+$/.test(href);
}

function image(raw: string): HeroImage | null {
  try {
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== "object") return null;
    const img = v as Record<string, unknown>;
    if (!isOwnImage(img, HERO_FOLDER)) return null;
    const width = Math.round(Number(img.width));
    const height = Math.round(Number(img.height));
    if (!(width > 0 && height > 0)) return null;
    return { url: img.url as string, publicId: img.publicId as string, width, height };
  } catch {
    return null;
  }
}

// Reads and checks a submitted slide. Nothing from the form is trusted.
async function parse(f: FormData): Promise<{ data: HeroSlideContent } | { error: string }> {
  const str = (k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
  const desktop = image(String(f.get("image") ?? ""));
  if (!desktop) return { error: "Upload a desktop photo." };
  const rawMobile = String(f.get("mobileImage") ?? "");
  const mobile = rawMobile ? image(rawMobile) : null;
  if (rawMobile && !mobile) return { error: "The mobile photo could not be read. Please upload it again." };

  const headline = str("headline", HERO_LIMITS.headline);
  if (!headline) return { error: "Add a headline." };
  const headlineColor = str("headlineColor", 7);
  if (!HEX_COLOR.test(headlineColor)) return { error: "Choose a valid headline colour." };

  const headlineStyle = pick(HERO_STYLES, str("headlineStyle", 10));
  const textX = pick(HERO_X, str("textX", 10));
  const textY = pick(HERO_Y, str("textY", 10));
  const textSize = pick(HERO_SIZES, str("textSize", 4));
  const focus = pick(HERO_FOCUS, str("focus", 10));
  const theme = pick(HERO_BUTTON_THEMES, str("buttonTheme", 10));
  if (!headlineStyle || !textX || !textY || !textSize || !focus || !theme) return { error: "One of the style choices is not valid." };

  const href = str("buttonHref", 300) || "/shop";
  if (!isSafeHref(href)) return { error: "The button link must start with / (for example /shop) or https://" };

  return {
    data: {
      image: desktop,
      mobileImage: mobile,
      alt: str("alt", HERO_LIMITS.alt),
      headline,
      subtext: str("subtext", HERO_LIMITS.subtext),
      headlineStyle,
      headlineColor: headlineColor.toLowerCase(),
      textX,
      textY,
      textSize,
      focus,
      button: { show: f.get("buttonShow") === "on", label: str("buttonLabel", HERO_LIMITS.buttonLabel) || "Shop now", href, theme },
    },
  };
}

export async function saveSlide(id: string | null, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const parsed = await parse(f);
  if ("error" in parsed) return { error: parsed.error };
  const active = f.get("active") === "on";
  await connectDb();

  if (!id) {
    if ((await HeroSlideModel.countDocuments()) >= MAX_HERO_SLIDES) return { error: `You can have up to ${MAX_HERO_SLIDES} slides.` };
    const last = await HeroSlideModel.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
    await HeroSlideModel.create({ ...parsed.data, active, sortOrder: (last?.sortOrder ?? 0) + 1 });
    refresh();
    return { saved: true };
  }

  if (!isId(id)) return { error: "Slide not found." };
  const old = await HeroSlideModel.findById(id).select("image mobileImage").lean();
  if (!old) return { error: "Slide not found." };
  await HeroSlideModel.updateOne({ _id: id }, { $set: { ...parsed.data, active } }, { runValidators: true });
  // Photos that were replaced or removed are deleted from Cloudinary.
  if (old.image?.publicId !== parsed.data.image.publicId) await deleteImage(old.image?.publicId);
  if (old.mobileImage?.publicId && old.mobileImage.publicId !== parsed.data.mobileImage?.publicId) await deleteImage(old.mobileImage.publicId);
  refresh();
  return { saved: true };
}

export async function setSlideActive(id: string, active: boolean) {
  await requireAdmin();
  if (!isId(id)) return;
  await connectDb();
  await HeroSlideModel.updateOne({ _id: id }, { $set: { active } });
  refresh();
}

export async function deleteSlide(id: string) {
  await requireAdmin();
  if (!isId(id)) return;
  await connectDb();
  const slide = await HeroSlideModel.findByIdAndDelete(id).lean();
  await deleteImage(slide?.image?.publicId);
  await deleteImage(slide?.mobileImage?.publicId);
  refresh();
}

// Swaps the slide with its neighbour so it shows earlier (-1) or later (+1).
export async function moveSlide(id: string, direction: -1 | 1) {
  await requireAdmin();
  if (!isId(id) || (direction !== -1 && direction !== 1)) return;
  await connectDb();
  const slides = await HeroSlideModel.find().sort({ sortOrder: 1, _id: 1 }).select("_id").lean();
  const i = slides.findIndex((s) => String(s._id) === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= slides.length) return;
  [slides[i], slides[j]] = [slides[j], slides[i]];
  await HeroSlideModel.bulkWrite(slides.map((s, n) => ({ updateOne: { filter: { _id: s._id }, update: { $set: { sortOrder: n + 1 } } } })));
  refresh();
}

export async function saveInterval(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const n = Number(f.get("interval"));
  if (!Number.isInteger(n) || n < HERO_INTERVAL.min || n > HERO_INTERVAL.max) {
    return { error: `Choose a whole number from ${HERO_INTERVAL.min} to ${HERO_INTERVAL.max} seconds.` };
  }
  await saveHeroInterval(n);
  refresh();
  return { saved: true };
}
