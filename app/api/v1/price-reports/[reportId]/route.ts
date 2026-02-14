import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import {
  adminAuditLogs,
  items,
  markets,
  priceReports,
  regions,
  reportVotes,
  users,
} from "@/src/server/db/schema";

const paramsSchema = z.object({
  reportId: z.coerce.number().int().positive(),
});

export async function GET(
  request: NextRequest,
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
      reporterUserId: priceReports.userId,
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

  const session = await getRequestSession(request);
  const currentUserId = session?.user
    ? await resolveAppUserId({
        email: session.user.email,
        name: session.user.name,
      })
    : null;

  const helpfulCountRows = await db
    .select({
      helpfulCount: sql<number>`count(*) filter (where ${reportVotes.isHelpful} = true)::int`,
    })
    .from(reportVotes)
    .where(eq(reportVotes.reportId, parsed.data.reportId))
    .limit(1);

  const currentUserVote = currentUserId
    ? await db
        .select({
          id: reportVotes.id,
          isHelpful: reportVotes.isHelpful,
        })
        .from(reportVotes)
        .where(
          and(
            eq(reportVotes.reportId, parsed.data.reportId),
            eq(reportVotes.userId, currentUserId),
          ),
        )
        .limit(1)
    : [];

  const row = rows[0];
  const hasHelpfulVote = currentUserVote[0]?.isHelpful ?? false;
  const canThumbsUp = !!currentUserId && !hasHelpfulVote;
  const canVerify =
    row.status === "pending" &&
    !!currentUserId &&
    !!row.reporterUserId &&
    row.reporterUserId !== currentUserId;

  const commentRows = await db
    .select({
      id: adminAuditLogs.id,
      message: sql<string>`coalesce(${adminAuditLogs.payload}->>'message', '')`,
      createdAt: adminAuditLogs.createdAt,
      userName: users.name,
    })
    .from(adminAuditLogs)
    .innerJoin(users, eq(adminAuditLogs.adminId, users.id))
    .where(
      and(
        eq(adminAuditLogs.entityType, "price_report_comment"),
        eq(adminAuditLogs.entityId, parsed.data.reportId),
        eq(adminAuditLogs.action, "comment"),
      ),
    )
    .orderBy(sql`${adminAuditLogs.createdAt} desc`)
    .limit(20);

  return ok({
    ...row,
    helpfulCount: helpfulCountRows[0]?.helpfulCount ?? 0,
    hasHelpfulVote,
    comments: commentRows,
    actions: {
      canThumbsUp,
      canVerify,
      canComment: !!currentUserId,
    },
  });
}
