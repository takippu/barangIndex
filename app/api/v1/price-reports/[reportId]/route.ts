import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { items, markets, priceReports, regions } from "@/src/server/db/schema";

const paramsSchema = z.object({
  reportId: z.coerce.number().int().positive(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ reportId: string }> },
) {
  const params = await context.params;
  const parsed = parseQuery(paramsSchema, params);
  if (parsed.error) {
    return parsed.error;
  }

  const rows = await db
    .select({
      id: priceReports.id,
      itemId: priceReports.itemId,
      itemName: items.name,
      itemCategory: items.category,
      defaultUnit: items.defaultUnit,
      currency: priceReports.currency,
      marketId: priceReports.marketId,
      marketName: markets.name,
      regionId: regions.id,
      regionName: regions.name,
      country: regions.country,
      price: priceReports.price,
      status: priceReports.status,
      reportedAt: priceReports.reportedAt,
      createdAt: priceReports.createdAt,
    })
    .from(priceReports)
    .innerJoin(items, eq(priceReports.itemId, items.id))
    .innerJoin(markets, eq(priceReports.marketId, markets.id))
    .innerJoin(regions, eq(priceReports.regionId, regions.id))
    .where(eq(priceReports.id, parsed.data.reportId))
    .limit(1);

  if (!rows[0]) {
    return fail("NOT_FOUND", "Report not found", 404);
  }

  return ok(rows[0]);
}
