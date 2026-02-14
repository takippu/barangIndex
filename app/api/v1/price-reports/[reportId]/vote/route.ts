import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { priceReports, reportVotes } from "@/src/server/db/schema";
import { awardReputation, checkAndAwardBadges } from "@/src/server/reputation";

const paramsSchema = z.object({
  reportId: z.coerce.number().int().positive(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ reportId: string }> },
) {
  const session = await getRequestSession(request);
  if (!session?.user) {
    return fail("UNAUTHENTICATED", "Authentication required", 401);
  }

  const params = await context.params;
  const parsed = parseQuery(paramsSchema, params);
  if (parsed.error) {
    return parsed.error;
  }

  const reportRow = await db
    .select({ id: priceReports.id, status: priceReports.status, userId: priceReports.userId })
    .from(priceReports)
    .where(eq(priceReports.id, parsed.data.reportId))
    .limit(1);

  if (!reportRow[0]) {
    return fail("NOT_FOUND", "Report not found", 404);
  }

  const appUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });

  if (!appUserId) {
    return fail("UNAUTHENTICATED", "Could not resolve app user", 401);
  }

  const existing = await db
    .select({ id: reportVotes.id, isHelpful: reportVotes.isHelpful })
    .from(reportVotes)
    .where(
      and(
        eq(reportVotes.reportId, parsed.data.reportId),
        eq(reportVotes.userId, appUserId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    if (!existing[0].isHelpful) {
      await db
        .update(reportVotes)
        .set({ isHelpful: true })
        .where(eq(reportVotes.id, existing[0].id));
    }
  } else {
    await db.insert(reportVotes).values({
      reportId: parsed.data.reportId,
      userId: appUserId,
      isHelpful: true,
    });
  }

  // Award +2 reputation to the report author (not the voter)
  const reportAuthorId = reportRow[0]?.userId;
  if (reportAuthorId && reportAuthorId !== appUserId) {
    await awardReputation(reportAuthorId, 2, `helpful vote on report #${parsed.data.reportId}`);
    await checkAndAwardBadges(reportAuthorId);
  }

  const helpfulCountRows = await db
    .select({
      helpfulCount: sql<number>`count(*) filter (where ${reportVotes.isHelpful} = true)::int`,
    })
    .from(reportVotes)
    .where(eq(reportVotes.reportId, parsed.data.reportId))
    .limit(1);

  return ok({
    reportId: parsed.data.reportId,
    helpfulCount: helpfulCountRows[0]?.helpfulCount ?? 0,
    hasHelpfulVote: true,
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ reportId: string }> },
) {
  const session = await getRequestSession(request);
  if (!session?.user) {
    return fail("UNAUTHENTICATED", "Authentication required", 401);
  }

  const params = await context.params;
  const parsed = parseQuery(paramsSchema, params);
  if (parsed.error) {
    return parsed.error;
  }

  const reportRowDel = await db
    .select({ id: priceReports.id, userId: priceReports.userId })
    .from(priceReports)
    .where(eq(priceReports.id, parsed.data.reportId))
    .limit(1);

  if (!reportRowDel[0]) {
    return fail("NOT_FOUND", "Report not found", 404);
  }

  const appUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });

  if (!appUserId) {
    return fail("UNAUTHENTICATED", "Could not resolve app user", 401);
  }

  const existing = await db
    .select({ id: reportVotes.id })
    .from(reportVotes)
    .where(
      and(
        eq(reportVotes.reportId, parsed.data.reportId),
        eq(reportVotes.userId, appUserId),
        eq(reportVotes.isHelpful, true),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(reportVotes)
      .set({ isHelpful: false })
      .where(eq(reportVotes.id, existing[0].id));

    // Deduct -2 reputation from the report author
    const authorId = reportRowDel[0]?.userId;
    if (authorId && authorId !== appUserId) {
      await awardReputation(authorId, -2, `unhelpful vote on report #${parsed.data.reportId}`);
    }
  }

  const helpfulCountRows = await db
    .select({
      helpfulCount: sql<number>`count(*) filter (where ${reportVotes.isHelpful} = true)::int`,
    })
    .from(reportVotes)
    .where(eq(reportVotes.reportId, parsed.data.reportId))
    .limit(1);

  return ok({
    reportId: parsed.data.reportId,
    helpfulCount: helpfulCountRows[0]?.helpfulCount ?? 0,
    hasHelpfulVote: false,
  });
}
