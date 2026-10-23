import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const categories = [
  { name: "Rings", slug: "rings" },
  { name: "Necklaces", slug: "necklaces" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bracelets", slug: "bracelets" },
  { name: "Pendants", slug: "pendants" },
];

// [category, name, price, material, featured, description]
const products = [
  ["rings", "Aurelia Solitaire Ring", 48500, "18k Gold", true, "A timeless solitaire with a hand-polished band and a brilliant-cut centre stone."],
  ["rings", "Soleil Twist Band", 32000, "Rose Gold", false, "Two intertwined bands in warm rose gold, made to be worn every day."],
  ["rings", "Noor Signet Ring", 27500, "Sterling Silver", false, "A softly domed signet with a satin finish. Engraving available on request."],
  ["rings", "Eterna Stacking Set", 39000, "18k Gold", true, "Three slim bands designed to be stacked or worn alone."],
  ["necklaces", "Luna Pearl Strand", 54000, "Pearl & Gold", true, "Freshwater pearls hand-knotted on silk with a gold clasp."],
  ["necklaces", "Mira Layered Chain", 36500, "Gold Plated", false, "A two-tier chain with a delicate bar pendant, adjustable length."],
  ["necklaces", "Opal Drop Necklace", 61000, "Sterling Silver", false, "A fiery opal teardrop on a fine silver chain."],
  ["earrings", "Celeste Drop Earrings", 29500, "Gold Plated", true, "Lightweight drops with a mirror finish that catch the light."],
  ["earrings", "Petite Hoops", 18500, "Sterling Silver", false, "Small, polished hoops that suit every day and every outfit."],
  ["earrings", "Rosette Studs", 22000, "Rose Gold", false, "Flower-shaped studs with a sparkling crystal heart."],
  ["bracelets", "Verve Tennis Bracelet", 72000, "18k Gold", true, "A line of brilliant stones set in a flexible, secure gold chain."],
  ["bracelets", "Ivy Charm Bracelet", 34000, "Sterling Silver", false, "A delicate chain with three hand-finished charms."],
  ["bracelets", "Amara Bangle", 41500, "Gold Plated", false, "A sculpted open bangle with a smooth, comfortable fit."],
  ["pendants", "Heartline Pendant", 26000, "Rose Gold", true, "A slim heart outline pendant, a gift that says plenty."],
  ["pendants", "Compass Pendant", 31500, "Sterling Silver", false, "A small compass for someone who is always finding their way."],
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

for (const c of categories) {
  await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
}

for (const [cat, name, price, material, featured, description] of products) {
  const category = await db.category.findUniqueOrThrow({ where: { slug: cat } });
  const slug = slugify(name);
  await db.product.upsert({
    where: { slug },
    update: {},
    create: { name, slug, price, material, featured, description, categoryId: category.id },
  });
}

for (const name of new Set(products.map((p) => p[3]))) {
  await db.material.upsert({ where: { name }, update: {}, create: { name } });
}

console.log("Seeded", categories.length, "categories and", products.length, "products");
await db.$disconnect();
