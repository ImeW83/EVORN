// Product options such as Color, Design or Size. Each product can have a few option groups; the customer picks
// one choice from every group. A choice can cost extra (e.g. "With stones" +300), be marked unavailable, and point
// at one of the product's own photos (by publicId) that the gallery shows when it is picked.

export type OptionChoice = { label: string; extra: number; available: boolean; image?: string | null };
export type OptionGroup = { name: string; choices: OptionChoice[] };
export type SelectedOption = { name: string; value: string };

export const OPTION_NAMES = ["Color", "Design", "Size"] as const; // each can be used once per product
export const OPTION_LIMITS = { groups: OPTION_NAMES.length, choices: 12, label: 40, extra: 1_000_000 };
// Offered while typing a choice; any other value can still be typed.
export const CHOICE_SUGGESTIONS: Record<string, string[]> = {
  Color: ["Gold", "Silver", "Rose gold", "Black", "White"],
  Size: ["Size 5", "Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Small", "Medium", "Large"],
};

// Lowest and highest possible price once every group has a choice.
export function priceRange(price: number, groups: OptionGroup[]) {
  let min = price;
  let max = price;
  for (const g of groups) {
    const extras = g.choices.map((c) => c.extra);
    min += Math.min(...extras);
    max += Math.max(...extras);
  }
  return { min, max };
}

// Extra cost of a full selection, or null if a group is missing, a choice doesn't exist or is unavailable.
export function selectionExtra(groups: OptionGroup[], selected: SelectedOption[]): number | null {
  if (selected.length !== groups.length) return null;
  let extra = 0;
  for (const g of groups) {
    const pick = selected.find((s) => s.name === g.name);
    const choice = pick && g.choices.find((c) => c.label === pick.value);
    if (!choice || !choice.available) return null;
    extra += choice.extra;
  }
  return extra;
}

// "Gold · Size 7"
export const optionsText = (options: SelectedOption[] | undefined) => (options ?? []).map((o) => o.value).join(" · ");
