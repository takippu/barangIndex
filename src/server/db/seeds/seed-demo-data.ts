import { and, eq, sql } from "drizzle-orm";

import { db, dbPool } from "@/src/server/db/client";
import {
  adminAuditLogs,
  items,
  markets,
  priceReports,
  regions,
  reportVotes,
  users,
} from "@/src/server/db/schema";

const seedItems = [
  {
    name: "Telur Ayam Gred A (30 biji)",
    slug: "telur-ayam-gred-a-30-biji",
    category: "protein",
    defaultUnit: "tray",
  },
  {
    name: "Ayam Proses Standard",
    slug: "ayam-proses-standard",
    category: "protein",
    defaultUnit: "kg",
  },
  {
    name: "Daging Lembu Tempatan",
    slug: "daging-lembu-tempatan",
    category: "protein",
    defaultUnit: "kg",
  },
  {
    name: "Ikan Kembung",
    slug: "ikan-kembung",
    category: "protein",
    defaultUnit: "kg",
  },
  {
    name: "Beras Super Special Tempatan 10kg",
    slug: "beras-super-special-tempatan-10kg",
    category: "grocery",
    defaultUnit: "bag",
  },
];

const seedContributors = [
  { name: "Aiman", email: "aiman.seed@groceryindex.local" },
  { name: "Siti", email: "siti.seed@groceryindex.local" },
  { name: "Farah", email: "farah.seed@groceryindex.local" },
  { name: "Hafiz", email: "hafiz.seed@groceryindex.local" },
  { name: "Nadia", email: "nadia.seed@groceryindex.local" },
  { name: "Jason", email: "jason.seed@groceryindex.local" },
  { name: "Kumar", email: "kumar.seed@groceryindex.local" },
  { name: "Mei Ling", email: "meiling.seed@groceryindex.local" },
  { name: "Amirul", email: "amirul.seed@groceryindex.local" },
  { name: "Syafiqah", email: "syafiqah.seed@groceryindex.local" },
];

const seedRegions = [
  { name: "Klang Valley", country: "Malaysia" },
  { name: "Penang", country: "Malaysia" },
  { name: "Johor Bahru", country: "Malaysia" },
];

const seedMarketsByRegion: Record<
  string,
  Array<{ name: string; latitude: string; longitude: string }>
> = {
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

const seedComments = [
  "Murah!",
  "Mahal gila ni",
  "Stock ada lagi?",
  "Baru beli tadi, fresh.",
  "Service mantap",
  "Harga naik sikit compared last week",
  "Berbaloi beli sini",
  "Ramai orang queue",
  "Parking susah sikit",
  "Ayam nampak segar",
  "Telur sold out pulak",
  "Recommended!",
  "Not bad",
];

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
      const id = await getOrCreateMarket(
        regionId,
        market.name,
        market.latitude,
        market.longitude,
      );
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

  // Ensure we cover "7 days from today which is 14/02/2026"
  // If today is 14/02/2026, then start date 120 days ago covers it.
  const totalDays = 125; // increased slightly to be safe
  const startDate = new Date(); // Use system time (2026-02-14)
  startDate.setDate(startDate.getDate() - 118); // Start ~4 months ago, ending roughly +7 days from now

  const rows: Array<{
    itemId: number;
    marketId: number;
    regionId: number;
    userId: number;
    price: string;
    status: "verified" | "pending" | "rejected";
    reportedAt: Date;
  }> = [];

  // Temporary storage for votes and comments, to be matched with report IDs after insertion
  // Actually, we need report IDs to insert votes/comments.
  // We can insert reports first, then loop through them to add votes/comments.
  // But we need to build the report objects first.
  // Wait, we can't do batched insert easily if we need IDs for child tables unless we insert one by one or return IDs.
  // Let's gather all report data, insert and return IDs, then generate votes/comments.

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
          pseudoRandom(day * 101 + market.id * 13 + itemId * 7) <
          Math.min(0.95, Math.max(0.35, basePresence));
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
        const extraReports =
          pseudoRandom(day * 59 + market.id * 61 + itemId * 67) > 0.9 ? 1 : 0;
        for (let extra = 0; extra < extraReports; extra++) {
          const extraValue = Math.max(
            0.1,
            value + (pseudoRandom((day + extra) * 71 + market.id) - 0.5) * 0.9,
          );
          const extraContributorIndex = Math.floor(
            pseudoRandom(day * 151 + market.id * 31 + itemId * 41 + extra) *
            contributorIds.length,
          );
          rows.push({
            itemId,
            marketId: market.id,
            regionId: market.regionId,
            userId: contributorIds[extraContributorIndex],
            price: extraValue.toFixed(2),
            status: "verified",
            reportedAt: atRandomTimeOnDate(
              currentDate,
              day * 79 + market.id * 83 + itemId * 89 + extra,
            ),
          });
        }
      }
    }
  }

  // Insert reports in chunks and get IDs back
  // Drizzle insert().values([...]).returning({ id: priceReports.id }) works for Postgres
  const chunkSize = 1000;
  const insertedReportIds: number[] = [];

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const returned = await db
      .insert(priceReports)
      .values(chunk)
      .returning({ id: priceReports.id });
    insertedReportIds.push(...returned.map((r) => r.id));
  }

  // Now generate votes and comments for inserted reports
  const voteRows: Array<{ reportId: number; userId: number; isHelpful: boolean }> =
    [];
  const commentRows: Array<{
    adminId: number;
    action: string;
    entityType: string;
    entityId: number;
    payload: unknown;
    createdAt: Date;
  }> = [];

  for (const reportId of insertedReportIds) {
    const seed = reportId * 13; // deterministic seed based on ID

    // Generate Likes (30% chance)
    if (pseudoRandom(seed) < 0.3) {
      const numLikes = 1 + Math.floor(pseudoRandom(seed * 7) * 5); // 1-5 likes
      const likedByUserIds = new Set<number>();

      for (let k = 0; k < numLikes; k++) {
        const likerIndex = Math.floor(
          pseudoRandom(seed * 11 + k) * contributorIds.length,
        );
        const likerId = contributorIds[likerIndex];
        if (!likedByUserIds.has(likerId)) {
          voteRows.push({
            reportId,
            userId: likerId,
            isHelpful: true,
          });
          likedByUserIds.add(likerId);
        }
      }
    }

    // Generate Comments (10% chance)
    if (pseudoRandom(seed * 3) < 0.1) {
      const numComments = 1 + Math.floor(pseudoRandom(seed * 5) * 2); // 1-2 comments
      for (let k = 0; k < numComments; k++) {
        const commenterIndex = Math.floor(
          pseudoRandom(seed * 17 + k) * contributorIds.length,
        );
        const commenterId = contributorIds[commenterIndex];
        const commentText =
          seedComments[Math.floor(pseudoRandom(seed * 23 + k) * seedComments.length)];

        // Random time slightly after report
        // We don't easily have the report time here without querying or mapping back.
        // For simplicity, just use now or random recent.
        // Actually best to use a time close to report, but let's just say "now" or random for seed simplicity,
        // or re-calculate based on ID if mapped?
        // Let's just use a random time within the last 30 days for simplicity, or just 'now'
        // Since adminAuditLogs.createdAt is what we want, let's just make it reasonably recent.
        commentRows.push({
          adminId: commenterId, // We use adminId col for userId in comments schema (based on audit logs usage)
          action: "comment",
          entityType: "price_report_comment",
          entityId: reportId,
          payload: { message: commentText },
          createdAt: new Date(), // Simplicity
        });
      }
    }
  }

  if (voteRows.length > 0) {
    for (let i = 0; i < voteRows.length; i += chunkSize) {
      await db
        .insert(reportVotes)
        .values(voteRows.slice(i, i + chunkSize))
        .onConflictDoNothing(); // Prevent duplicate votes if logic flawed
    }
  }

  if (commentRows.length > 0) {
    for (let i = 0; i < commentRows.length; i += chunkSize) {
      await db.insert(adminAuditLogs).values(commentRows.slice(i, i + chunkSize));
    }
  }

  const now = new Date();
  for (const contributorId of contributorIds) {
    const personalRows = rows.filter((row) => row.userId === contributorId);
    await db
      .update(users)
      .set({
        reportCount: personalRows.length,
        verifiedReportCount: personalRows.filter((row) => row.status === "verified")
          .length,
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
- Votes: ${voteRows.length}
- Comments: ${commentRows.length}
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
