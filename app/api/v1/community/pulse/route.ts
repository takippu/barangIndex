import { and, eq, gte, sql, lte } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { items, priceReports, regions } from "@/src/server/db/schema";

const querySchema = z.object({
  regionId: z.coerce.number().int().positive().optional(),
  days: z.coerce.number().int().min(0).max(365).default(7),
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

  // Always filter future reports to avoid skewing stats
  filters.push(lte(priceReports.reportedAt, new Date()));

  // If days=0, get all-time stats (no date filter)
  const isAllTime = parsed.data.days === 0;

  if (!isAllTime) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parsed.data.days);
    filters.push(gte(priceReports.reportedAt, fromDate));
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  const [totals, totalItems] = await Promise.all([
    db
      .select({
        totalReports: sql<number>`count(*)::int`,
        verifiedReports: sql<number>`count(*) filter (where ${priceReports.status} = 'verified')::int`,
        pendingReports: sql<number>`count(*) filter (where ${priceReports.status} = 'pending')::int`,
        activeMarkets: sql<number>`count(distinct ${priceReports.marketId})::int`,
        activeContributors: sql<number>`count(distinct ${priceReports.userId})::int`,
        lastReportedAt: sql<string | null>`max(${priceReports.reportedAt})::text`,
      })
      .from(priceReports)
      .where(whereClause),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(items)
      .where(eq(items.isActive, true)),
  ]);

  // Only get time series data when not querying all-time
  let series: Array<{ date: string; reports: number; verifiedReports: number }> = [];
  if (!isAllTime) {
    const dayExpr = sql<string>`date(${priceReports.reportedAt})`;
    series = await db
      .select({
        date: dayExpr,
        reports: sql<number>`count(*)::int`,
        verifiedReports: sql<number>`count(*) filter (where ${priceReports.status} = 'verified')::int`,
      })
      .from(priceReports)
      .where(whereClause)
      .groupBy(dayExpr)
      .orderBy(dayExpr);
  }

  let region: { id: number | null; name: string } = { id: null, name: "All Areas" };
  if (parsed.data.regionId) {
    const selectedRegion = await db
      .select({ id: regions.id, name: regions.name })
      .from(regions)
      .where(eq(regions.id, parsed.data.regionId))
      .limit(1);

    region = selectedRegion[0] ? { id: selectedRegion[0].id, name: selectedRegion[0].name } : region;
  }

  return ok({
    region,
    days: parsed.data.days,
    totals: {
      ...(totals[0] ?? {
        totalReports: 0,
        verifiedReports: 0,
        pendingReports: 0,
        activeMarkets: 0,
        activeContributors: 0,
        lastReportedAt: null,
      }),
      totalItems: totalItems[0]?.count ?? 0,
    },
    series,
  });
}
