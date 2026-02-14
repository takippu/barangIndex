import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { priceReports, users } from "@/src/server/db/schema";
import { notifyReportVerified } from "@/src/server/notifications";
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

  const appUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });
  if (!appUserId) {
    return fail("UNAUTHENTICATED", "Could not resolve app user", 401);
  }

  const reportRows = await db
    .select({
      id: priceReports.id,
      status: priceReports.status,
      userId: priceReports.userId,
    })
    .from(priceReports)
    .where(eq(priceReports.id, parsed.data.reportId))
    .limit(1);

  const report = reportRows[0];
  if (!report) {
    return fail("NOT_FOUND", "Report not found", 404);
  }

  if (report.status !== "pending") {
    return fail("CONFLICT", "Report is not pending", 409);
  }

  if (report.userId && report.userId === appUserId) {
    return fail("FORBIDDEN", "You cannot verify your own report", 403);
  }

  const updated = await db
    .update(priceReports)
    .set({
      status: "verified",
      verifiedBy: appUserId,
      verifiedAt: new Date(),
    })
    .where(
      and(
        eq(priceReports.id, parsed.data.reportId),
        eq(priceReports.status, "pending"),
      ),
    )
    .returning({
      id: priceReports.id,
      status: priceReports.status,
      verifiedAt: priceReports.verifiedAt,
    });

  if (!updated[0]) {
    return fail("CONFLICT", "Report status changed, please refresh", 409);
  }

  // Award reputation to both parties
  if (report.userId) {
    // Reporter gets +15 for having their report verified
    await awardReputation(report.userId, 15, `report #${report.id} verified`);
    await db
      .update(users)
      .set({
        verifiedReportCount: sql`${users.verifiedReportCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, report.userId));
    await checkAndAwardBadges(report.userId);

    // Notify the reporter
    await notifyReportVerified(report.userId, report.id, "your item");
  }
  // Verifier gets +5
  await awardReputation(appUserId, 5, `verified report #${report.id}`);
  await checkAndAwardBadges(appUserId);

  return ok(updated[0]);
}
