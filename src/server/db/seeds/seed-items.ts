import { dbPool, db } from "@/src/server/db/client";
import { items } from "@/src/server/db/schema";

const seedItems = [
  {
    name: "Eggs (Grade A tray 30)",
    slug: "eggs-grade-a-tray-30",
    category: "protein",
    defaultUnit: "tray",
  },
  {
    name: "Whole Chicken",
    slug: "whole-chicken",
    category: "protein",
    defaultUnit: "kg",
  },
  {
    name: "Chicken Breast",
    slug: "chicken-breast",
    category: "protein",
    defaultUnit: "kg",
  },
  {
    name: "Beef",
    slug: "beef",
    category: "protein",
    defaultUnit: "kg",
  },
  {
    name: "Mackerel Fish",
    slug: "mackerel-fish",
    category: "protein",
    defaultUnit: "kg",
  },
  {
    name: "Cooking Oil (5kg)",
    slug: "cooking-oil-5kg",
    category: "grocery",
    defaultUnit: "bottle",
  },
  {
    name: "Rice (10kg)",
    slug: "rice-10kg",
    category: "grocery",
    defaultUnit: "bag",
  },
  {
    name: "Onion",
    slug: "onion",
    category: "vegetable",
    defaultUnit: "kg",
  },
  {
    name: "Tomato",
    slug: "tomato",
    category: "vegetable",
    defaultUnit: "kg",
  },
  {
    name: "Cabbage",
    slug: "cabbage",
    category: "vegetable",
    defaultUnit: "kg",
  },
];

async function run() {
  await db
    .insert(items)
    .values(seedItems)
    .onConflictDoUpdate({
      target: items.slug,
      set: {
        name: items.name,
        category: items.category,
        defaultUnit: items.defaultUnit,
        isActive: true,
      },
    });

  console.log(`Seeded ${seedItems.length} core items (idempotent)`);
}

run()
  .catch((error) => {
    console.error("Failed to seed items", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await dbPool.end();
  });
