import { and, desc, eq, lt } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { items, markets, priceReports } from "@/src/server/db/schema";

const querySchema = z.object({
  regionId: z.coerce.number().int().positive().optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = parseQuery(querySchema, query);
  if (parsed.error) {
    return parsed.error;
  }

  const filters = [];
  if (parsed.data.regionId) {
    filters.push(eq(priceReports.regionId, parsed.data.regionId));
  }

  if (parsed.data.cursor) {
    filters.push(lt(priceReports.id, parsed.data.cursor));
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: priceReports.id,
      itemId: priceReports.itemId,
      itemName: items.name,
      marketId: priceReports.marketId,
      marketName: markets.name,
      regionId: priceReports.regionId,
      price: priceReports.price,
      status: priceReports.status,
      reportedAt: priceReports.reportedAt,
      createdAt: priceReports.createdAt,
    })
    .from(priceReports)
    .innerJoin(items, eq(priceReports.itemId, items.id))
    .innerJoin(markets, eq(priceReports.marketId, markets.id))
    .where(whereClause)
    .orderBy(desc(priceReports.id))
    .limit(parsed.data.limit + 1);

  const hasNextPage = rows.length > parsed.data.limit;
  const data = hasNextPage ? rows.slice(0, parsed.data.limit) : rows;
  const nextCursor = hasNextPage ? data[data.length - 1]?.id ?? null : null;

  return ok({ data, nextCursor });
}
