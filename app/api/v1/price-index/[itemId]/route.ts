import { and, eq, gte, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { items, priceReports } from "@/src/server/db/schema";

const paramsSchema = z.object({
  itemId: z.coerce.number().int().positive(),
});

const querySchema = z.object({
  regionId: z.coerce.number().int().positive().optional(),
  timeframe: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
});

const timeframeDays: Record<"7d" | "30d" | "90d" | "1y", number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> },
) {
  const params = await context.params;
  const parsedParams = parseQuery(paramsSchema, params);
  if (parsedParams.error) {
    return parsedParams.error;
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsedQuery = parseQuery(querySchema, query);
  if (parsedQuery.error) {
    return parsedQuery.error;
  }

  const itemRow = await db
    .select({ id: items.id, name: items.name, defaultUnit: items.defaultUnit, currency: items.currency })
    .from(items)
    .where(eq(items.id, parsedParams.data.itemId))
    .limit(1);

  if (!itemRow[0]) {
    return fail("NOT_FOUND", "Item not found", 404);
  }

  const timeframeKey = parsedQuery.data.timeframe as keyof typeof timeframeDays;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - timeframeDays[timeframeKey]);

  const filters = [
    eq(priceReports.itemId, parsedParams.data.itemId),
    gte(priceReports.reportedAt, fromDate),
    eq(priceReports.status, "verified"),
  ];

  if (parsedQuery.data.regionId) {
    filters.push(eq(priceReports.regionId, parsedQuery.data.regionId));
  }

  const stats = await db
    .select({
      avgPrice: sql<string>`coalesce(round(avg(${priceReports.price})::numeric, 2)::text, '0')`,
      minPrice: sql<string>`coalesce(min(${priceReports.price})::text, '0')`,
      maxPrice: sql<string>`coalesce(max(${priceReports.price})::text, '0')`,
      reportCount: sql<number>`count(*)::int`,
    })
    .from(priceReports)
    .where(and(...filters));

  const latest = await db
    .select({
      latestPrice: priceReports.price,
      latestReportedAt: priceReports.reportedAt,
    })
    .from(priceReports)
    .where(and(...filters))
    .orderBy(sql`${priceReports.reportedAt} desc`)
    .limit(1);

  const dayExpr = sql<string>`date(${priceReports.reportedAt})`;
  const series = await db
    .select({
      date: dayExpr,
      avgPrice: sql<string>`round(avg(${priceReports.price})::numeric, 2)::text`,
    })
    .from(priceReports)
    .where(and(...filters))
    .groupBy(dayExpr)
    .orderBy(dayExpr);

  return ok({
    item: itemRow[0],
    timeframe: timeframeKey,
    stats: {
      ...stats[0],
      latestPrice: latest[0]?.latestPrice ?? null,
      latestReportedAt: latest[0]?.latestReportedAt ?? null,
    },
    series,
  });
}
