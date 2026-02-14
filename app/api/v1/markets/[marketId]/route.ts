import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { fail, ok } from "@/src/server/api/http";
import { db } from "@/src/server/db/client";
import { items, markets, priceReports, regions } from "@/src/server/db/schema";

type RouteContext = {
  params: Promise<{ marketId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { marketId: marketIdRaw } = await context.params;
  const marketId = Number.parseInt(marketIdRaw, 10);

  if (!Number.isFinite(marketId) || marketId <= 0) {
    return fail("BAD_REQUEST", "Invalid marketId", 400);
  }

  const marketRows = await db
    .select({
      id: markets.id,
      name: markets.name,
      latitude: markets.latitude,
      longitude: markets.longitude,
      regionId: regions.id,
      regionName: regions.name,
      country: regions.country,
    })
    .from(markets)
    .innerJoin(regions, eq(markets.regionId, regions.id))
    .where(eq(markets.id, marketId))
    .limit(1);

  const market = marketRows[0];
  if (!market) {
    return fail("NOT_FOUND", "Market not found", 404);
  }

  const reportRows = await db
    .select({
      id: priceReports.id,
      itemId: priceReports.itemId,
      itemName: items.name,
      price: priceReports.price,
      currency: priceReports.currency,
      status: priceReports.status,
      reportedAt: priceReports.reportedAt,
    })
    .from(priceReports)
    .innerJoin(items, eq(priceReports.itemId, items.id))
    .where(eq(priceReports.marketId, marketId))
    .orderBy(desc(priceReports.reportedAt))
    .limit(80);

  const latestByItem = new Map<
    number,
    {
      itemId: number;
      itemName: string;
      price: string;
      currency: string;
      status: "pending" | "verified" | "rejected";
      reportedAt: Date;
    }
  >();
  for (const row of reportRows) {
    if (!latestByItem.has(row.itemId)) {
      latestByItem.set(row.itemId, {
        itemId: row.itemId,
        itemName: row.itemName,
        price: row.price,
        currency: row.currency,
        status: row.status,
        reportedAt: row.reportedAt,
      });
    }
  }

  return ok({
    market,
    stats: {
      totalReports: reportRows.length,
      latestReportedAt: reportRows[0]?.reportedAt ?? null,
      itemCount: latestByItem.size,
    },
    latestPrices: Array.from(latestByItem.values()),
    recentReports: reportRows.slice(0, 10),
  });
}
