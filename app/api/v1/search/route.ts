import { and, eq, ilike, or, sql, desc, lte, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { items, markets, priceReports } from "@/src/server/db/schema";

const querySchema = z.object({
  query: z.string().trim().min(1),
  regionId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = parseQuery(querySchema, query);
  if (parsed.error) {
    return parsed.error;
  }

  const itemRows = await db
    .select({
      id: items.id,
      type: sql<string>`'item'`,
      name: items.name,
      defaultUnit: items.defaultUnit,
      slug: items.slug,
      category: items.category,
    })
    .from(items)
    .where(
      and(
        eq(items.isActive, true),
        or(ilike(items.name, `%${parsed.data.query}%`), ilike(items.slug, `%${parsed.data.query}%`)),
      ),
    )
    .limit(parsed.data.limit);

  const marketFilters = [
    eq(markets.isActive, true),
    ilike(markets.name, `%${parsed.data.query}%`),
  ];

  if (parsed.data.regionId) {
    marketFilters.push(eq(markets.regionId, parsed.data.regionId));
  }

  const marketRows = await db
    .select({
      id: markets.id,
      type: sql<string>`'market'`,
      name: markets.name,
      regionId: markets.regionId,
    })
    .from(markets)
    .where(and(...marketFilters))
    .limit(parsed.data.limit);

  const reportRows = await db
    .select({
      id: priceReports.id,
      type: sql<string>`'report'`,
      itemId: priceReports.itemId,
      itemName: items.name,
      marketId: priceReports.marketId,
      marketName: markets.name,
      marketRegionId: markets.regionId,
      price: priceReports.price,
      currency: priceReports.currency,
      status: priceReports.status,
      reportedAt: priceReports.reportedAt,
    })
    .from(priceReports)
    .innerJoin(items, eq(priceReports.itemId, items.id))
    .innerJoin(markets, eq(priceReports.marketId, markets.id))
    .innerJoin(markets, eq(priceReports.marketId, markets.id))
    .where(
      and(
        parsed.data.regionId
          ? and(
            ilike(items.name, `%${parsed.data.query}%`),
            eq(priceReports.regionId, parsed.data.regionId),
          )
          : ilike(items.name, `%${parsed.data.query}%`),
        lte(priceReports.reportedAt, new Date()), // Filter future reports
        inArray(priceReports.status, ["verified", "pending"]), // Explicitly allow pending
      ),
    )
    .orderBy(desc(priceReports.reportedAt))
    .limit(parsed.data.limit);

  return ok({
    items: itemRows,
    markets: marketRows,
    reports: reportRows,
  });
}
