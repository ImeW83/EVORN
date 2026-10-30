// The two main shop sections. Every product belongs to Ladies, Men or both; categories (Rings, Necklaces...) sit
// under each section.
export const SECTIONS = [
  { slug: "ladies", name: "Ladies", title: "Ladies' jewellery" },
  { slug: "men", name: "Men", title: "Men's jewellery" },
] as const;

export type SectionSlug = (typeof SECTIONS)[number]["slug"];

// Products saved before sections existed have none stored; they count as Ladies.
export const DEFAULT_SECTIONS: SectionSlug[] = ["ladies"];

export const isSection = (v: unknown): v is SectionSlug => SECTIONS.some((s) => s.slug === v);
export const sectionOf = (slug: string | undefined) => SECTIONS.find((s) => s.slug === slug);
