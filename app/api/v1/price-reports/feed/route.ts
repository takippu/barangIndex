import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { adminAuditLogs, items, markets, priceReports, reportVotes } from "@/src/server/db/schema";

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

  // Resolve current user (optional - for hasHelpfulVote)
  let currentUserId: number | null = null;
  try {
    const session = await getRequestSession(request);
    if (session?.user) {
      currentUserId = await resolveAppUserId({
        email: session.user.email,
        name: session.user.name,
      });
    }
  } catch {
    // Guest user - no vote status
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
  const feedRows = hasNextPage ? rows.slice(0, parsed.data.limit) : rows;
  const nextCursor = hasNextPage ? feedRows[feedRows.length - 1]?.id ?? null : null;

  // Enrich with vote/comment counts
  const reportIds = feedRows.map(r => r.id);

  let voteCounts = new Map<number, number>();
  let userVotes = new Set<number>();
  let commentCounts = new Map<number, number>();

  if (reportIds.length > 0) {
    // Get vote counts
    const voteRows = await db
      .select({
        reportId: reportVotes.reportId,
        helpfulCount: sql<number>`count(*) filter (where ${reportVotes.isHelpful} = true)::int`,
      })
      .from(reportVotes)
      .where(inArray(reportVotes.reportId, reportIds))
      .groupBy(reportVotes.reportId);

    for (const row of voteRows) {
      voteCounts.set(row.reportId, row.helpfulCount);
    }

    // Get current user's votes
    if (currentUserId) {
      const userVoteRows = await db
        .select({ reportId: reportVotes.reportId })
        .from(reportVotes)
        .where(
          and(
            inArray(reportVotes.reportId, reportIds),
            eq(reportVotes.userId, currentUserId),
            eq(reportVotes.isHelpful, true),
          ),
        );

      for (const row of userVoteRows) {
        userVotes.add(row.reportId);
      }
    }

    // Get comment counts
    const commentRows = await db
      .select({
        entityId: adminAuditLogs.entityId,
        count: sql<number>`count(*)::int`,
      })
      .from(adminAuditLogs)
      .where(
        and(
          eq(adminAuditLogs.entityType, "price_report_comment"),
          inArray(adminAuditLogs.entityId, reportIds),
        ),
      )
      .groupBy(adminAuditLogs.entityId);

    for (const row of commentRows) {
      if (row.entityId !== null) {
        commentCounts.set(row.entityId, row.count);
      }
    }
  }

  const data = feedRows.map(row => ({
    ...row,
    helpfulCount: voteCounts.get(row.id) ?? 0,
    hasHelpfulVote: userVotes.has(row.id),
    commentCount: commentCounts.get(row.id) ?? 0,
  }));

  return ok({ data, nextCursor });
}
