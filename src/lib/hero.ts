// Home page hero carousel: the choices a slide can make, shared by the admin form, the server checks and the storefront.
export const HERO_STYLES = ["script", "serif", "bold"] as const;
export const HERO_X = ["left", "center", "right"] as const;
export const HERO_Y = ["upper", "middle", "lower"] as const;
export const HERO_SIZES = ["sm", "md", "lg", "xl"] as const;
export const HERO_FOCUS = ["left", "center", "right"] as const;
export const HERO_BUTTON_THEMES = ["light", "dark"] as const;

export type HeroStyle = (typeof HERO_STYLES)[number];
export type HeroX = (typeof HERO_X)[number];
export type HeroY = (typeof HERO_Y)[number];
export type HeroSize = (typeof HERO_SIZES)[number];
export type HeroFocus = (typeof HERO_FOCUS)[number];
export type HeroButtonTheme = (typeof HERO_BUTTON_THEMES)[number];

export const HERO_LIMITS = { headline: 60, subtext: 120, buttonLabel: 24, alt: 160 } as const;
export const MAX_HERO_SLIDES = 8;
export const HERO_INTERVAL = { min: 2, max: 10, default: 4 } as const; // seconds between slides
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const HERO_LABELS = {
  style: { script: "Script (elegant handwriting)", serif: "Display serif (uppercase)", bold: "Bold condensed (uppercase)" },
  x: { left: "Left", center: "Centre", right: "Right" },
  y: { upper: "Upper", middle: "Middle", lower: "Lower" },
  size: { sm: "Small", md: "Medium", lg: "Large", xl: "Extra large" },
  focus: { left: "Left side", center: "Centre", right: "Right side" },
  theme: { light: "Light (white button)", dark: "Dark (brown button)" },
} as const;

export type HeroImage = { url: string; publicId: string; width: number; height: number };

// What a slide needs to render; the stored slide adds id, sortOrder and active.
export type HeroSlideContent = {
  image: HeroImage;
  mobileImage: HeroImage | null;
  alt: string;
  headline: string;
  subtext: string;
  headlineStyle: HeroStyle;
  headlineColor: string;
  textX: HeroX;
  textY: HeroY;
  textSize: HeroSize;
  focus: HeroFocus;
  button: { show: boolean; label: string; href: string; theme: HeroButtonTheme };
};

export type HeroSlide = HeroSlideContent & { id: string; sortOrder: number; active: boolean };
