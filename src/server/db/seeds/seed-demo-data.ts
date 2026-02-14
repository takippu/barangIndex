import { and, eq, sql } from "drizzle-orm";

import { db, dbPool } from "@/src/server/db/client";
import { items, markets, priceReports, regions, users } from "@/src/server/db/schema";

const seedItems = [
  { name: "Telur Ayam Gred A (30 biji)", slug: "telur-ayam-gred-a-30-biji", category: "protein", defaultUnit: "tray" },
  { name: "Ayam Proses Standard", slug: "ayam-proses-standard", category: "protein", defaultUnit: "kg" },
  { name: "Daging Lembu Tempatan", slug: "daging-lembu-tempatan", category: "protein", defaultUnit: "kg" },
  { name: "Ikan Kembung", slug: "ikan-kembung", category: "protein", defaultUnit: "kg" },
  { name: "Beras Super Special Tempatan 10kg", slug: "beras-super-special-tempatan-10kg", category: "grocery", defaultUnit: "bag" },
];

const seedContributors = [
  { name: "Aiman", email: "aiman.seed@barangharga.local" },
  { name: "Siti", email: "siti.seed@barangharga.local" },
  { name: "Farah", email: "farah.seed@barangharga.local" },
  { name: "Hafiz", email: "hafiz.seed@barangharga.local" },
  { name: "Nadia", email: "nadia.seed@barangharga.local" },
  { name: "Jason", email: "jason.seed@barangharga.local" },
  { name: "Kumar", email: "kumar.seed@barangharga.local" },
  { name: "Mei Ling", email: "meiling.seed@barangharga.local" },
  { name: "Amirul", email: "amirul.seed@barangharga.local" },
  { name: "Syafiqah", email: "syafiqah.seed@barangharga.local" },
];

const seedRegions = [
  { name: "Klang Valley", country: "Malaysia" },
  { name: "Penang", country: "Malaysia" },
  { name: "Johor Bahru", country: "Malaysia" },
];

const seedMarketsByRegion: Record<string, Array<{ name: string; latitude: string; longitude: string }>> = {
  "Klang Valley": [
    { name: "Pasar Besar Chow Kit", latitude: "3.164100", longitude: "101.696900" },
    { name: "Pasar Borong Selayang", latitude: "3.238800", longitude: "101.684400" },
    { name: "NSK Trade City Kuchai Lama", latitude: "3.090200", longitude: "101.678200" },
    { name: "Lotus's Kepong", latitude: "3.201900", longitude: "101.628300" },
    { name: "Jaya Grocer Intermark", latitude: "3.159800", longitude: "101.715300" },
    { name: "Village Grocer Bangsar Village", latitude: "3.131800", longitude: "101.673700" },
  ],
  Penang: [
    { name: "Bayan Baru Market", latitude: "5.331600", longitude: "100.285700" },
    { name: "Pulau Tikus Market", latitude: "5.438700", longitude: "100.306500" },
    { name: "Lotus's E-Gate", latitude: "5.398700", longitude: "100.316900" },
  ],
  "Johor Bahru": [
    { name: "Larkin Market", latitude: "1.500700", longitude: "103.742700" },
    { name: "Taman Ungku Tun Aminah Market", latitude: "1.542700", longitude: "103.671200" },
    { name: "Lotus's Setia Tropika", latitude: "1.558800", longitude: "103.744700" },
  ],
};

const itemBasePrice: Record<string, number> = {
  "telur-ayam-gred-a-30-biji": 13.9,
  "ayam-proses-standard": 10.9,
  "daging-lembu-tempatan": 37.2,
  "ikan-kembung": 18.5,
  "beras-super-special-tempatan-10kg": 41.8,
};

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function atRandomTimeOnDate(date: Date, seed: number) {
  const d = new Date(date);
  const hour = 7 + Math.floor(pseudoRandom(seed * 11) * 14); // 07:00-20:59
  const minute = Math.floor(pseudoRandom(seed * 17) * 60);
  const second = Math.floor(pseudoRandom(seed * 23) * 60);
  d.setHours(hour, minute, second, 0);
  return d;
}

async function getOrCreateRegion(name: string, country: string) {
  const existing = await db
    .select({ id: regions.id })
    .from(regions)
    .where(and(eq(regions.name, name), eq(regions.country, country)))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(regions)
    .values({ name, country })
    .returning({ id: regions.id });

  return inserted[0].id;
}

async function getOrCreateMarket(
  regionId: number,
  name: string,
  latitude: string,
  longitude: string,
) {
  const existing = await db
    .select({ id: markets.id })
    .from(markets)
    .where(and(eq(markets.regionId, regionId), eq(markets.name, name)))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(markets)
    .values({
      name,
      regionId,
      latitude,
      longitude,
      isActive: true,
    })
    .returning({ id: markets.id });

  return inserted[0].id;
}

async function run() {
  // Start from a clean app-domain dataset for repeatable demo seeding.
  await db.execute(sql`
    TRUNCATE TABLE
      admin_audit_logs,
      report_votes,
      user_reputation_events,
      user_badges,
      badges,
      price_reports,
      item_variants,
      markets,
      regions,
      items
    RESTART IDENTITY CASCADE
  `);

  await db.execute(sql`
    UPDATE users
    SET report_count = 0,
        verified_report_count = 0,
        updated_at = now()
  `);

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

  const itemRows = await db
    .select({ id: items.id, slug: items.slug })
    .from(items)
    .where(eq(items.isActive, true));
  const itemIdBySlug = new Map(itemRows.map((row) => [row.slug, row.id]));

  const regionIdByName = new Map<string, number>();
  for (const region of seedRegions) {
    const id = await getOrCreateRegion(region.name, region.country);
    regionIdByName.set(region.name, id);
  }

  const marketRows: Array<{ id: number; regionId: number }> = [];
  for (const [regionName, marketList] of Object.entries(seedMarketsByRegion)) {
    const regionId = regionIdByName.get(regionName);
    if (!regionId) continue;
    for (const market of marketList) {
      const id = await getOrCreateMarket(regionId, market.name, market.latitude, market.longitude);
      marketRows.push({ id, regionId });
    }
  }

  const contributorIds: number[] = [];
  for (const contributor of seedContributors) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, contributor.email))
      .limit(1);

    if (existing[0]) {
      contributorIds.push(existing[0].id);
      continue;
    }

    const inserted = await db
      .insert(users)
      .values({
        email: contributor.email,
        name: contributor.name,
        role: "user",
        reputation: 100,
      })
      .returning({ id: users.id });

    contributorIds.push(inserted[0].id);
  }

  const totalDays = 120;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - totalDays);

  const rows: Array<{
    itemId: number;
    marketId: number;
    regionId: number;
    userId: number;
    price: string;
    status: "verified" | "pending" | "rejected";
    reportedAt: Date;
  }> = [];

  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    const daySeasonality = 0.5 + 0.5 * Math.sin(day / 6);

    for (const market of marketRows) {
      const marketActivityBase = 0.65 + pseudoRandom(market.id * 29) * 0.25;

      for (const item of seedItems) {
        const itemId = itemIdBySlug.get(item.slug);
        if (!itemId) continue;

        const basePresence = marketActivityBase + daySeasonality * 0.18;
        const shouldInsert =
          pseudoRandom(day * 101 + market.id * 13 + itemId * 7) < Math.min(0.95, Math.max(0.35, basePresence));
        if (!shouldInsert) continue;

        const base = itemBasePrice[item.slug];
        const marketNoise = (pseudoRandom(market.id * 19 + day) - 0.5) * 0.8;
        const weeklySeasonality = Math.sin(day / 7) * 0.35;
        const trend = day * 0.003;
        const value = Math.max(0.1, base + marketNoise + weeklySeasonality + trend);
        const statusRoll = pseudoRandom(day * 37 + market.id * 41 + itemId * 43);
        const status: "verified" | "pending" | "rejected" =
          statusRoll < 0.84 ? "verified" : statusRoll < 0.96 ? "pending" : "rejected";
        const contributorIndex = Math.floor(
          pseudoRandom(day * 131 + market.id * 17 + itemId * 19) * contributorIds.length,
        );

        rows.push({
          itemId,
          marketId: market.id,
          regionId: market.regionId,
          userId: contributorIds[contributorIndex],
          price: value.toFixed(2),
          status,
          reportedAt: atRandomTimeOnDate(currentDate, day + market.id + itemId),
        });

        // Some days get extra reports to create realistic spikes.
        const extraReports = pseudoRandom(day * 59 + market.id * 61 + itemId * 67) > 0.9 ? 1 : 0;
        for (let extra = 0; extra < extraReports; extra++) {
          const extraValue = Math.max(0.1, value + (pseudoRandom((day + extra) * 71 + market.id) - 0.5) * 0.9);
          const extraContributorIndex = Math.floor(
            pseudoRandom(day * 151 + market.id * 31 + itemId * 41 + extra) * contributorIds.length,
          );
          rows.push({
            itemId,
            marketId: market.id,
            regionId: market.regionId,
            userId: contributorIds[extraContributorIndex],
            price: extraValue.toFixed(2),
            status: "verified",
            reportedAt: atRandomTimeOnDate(currentDate, day * 79 + market.id * 83 + itemId * 89 + extra),
          });
        }
      }
    }
  }

  const chunkSize = 1000;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await db.insert(priceReports).values(rows.slice(i, i + chunkSize));
  }

  const now = new Date();
  for (const contributorId of contributorIds) {
    const personalRows = rows.filter((row) => row.userId === contributorId);
    await db
      .update(users)
      .set({
        reportCount: personalRows.length,
        verifiedReportCount: personalRows.filter((row) => row.status === "verified").length,
        updatedAt: now,
      })
      .where(eq(users.id, contributorId));
  }

  console.log(`Seeded demo data:
- Items: ${seedItems.length}
- Regions: ${seedRegions.length}
- Markets: ${marketRows.length}
- Contributors: ${contributorIds.length}
- Historical reports: ${rows.length}
`);
}

run()
  .catch((error) => {
    console.error("Failed to seed demo data", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await dbPool.end();
  });
