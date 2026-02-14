import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { fail, ok } from "@/src/server/api/http";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { priceReports, userBadges, users } from "@/src/server/db/schema";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session?.user?.email) {
    return fail("UNAUTHENTICATED", "Authentication required", 401);
  }

  const appUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });

  if (!appUserId) {
    return fail("INTERNAL_ERROR", "Unable to resolve app user", 500);
  }

  const appUser = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      reputation: users.reputation,
      reportCount: users.reportCount,
      verifiedReportCount: users.verifiedReportCount,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, appUserId))
    .limit(1);

  const reportStats = await db
    .select({
      totalReports: sql<number>`count(*)::int`,
      verifiedReports: sql<number>`count(*) filter (where ${priceReports.status} = 'verified')::int`,
    })
    .from(priceReports)
    .where(eq(priceReports.userId, appUserId));

  const badgeStats = await db
    .select({
      badgeCount: sql<number>`count(*)::int`,
    })
    .from(userBadges)
    .where(eq(userBadges.userId, appUserId));

  return ok({
    sessionUser: {
      name: session.user.name ?? null,
      email: session.user.email,
      image: session.user.image ?? null,
    },
    appUser: appUser[0] ?? null,
    stats: {
      totalReports: reportStats[0]?.totalReports ?? 0,
      verifiedReports: reportStats[0]?.verifiedReports ?? 0,
      badgeCount: badgeStats[0]?.badgeCount ?? 0,
    },
  });
}
