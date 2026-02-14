import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { fail, ok } from "@/src/server/api/http";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import {
  badges,
  items,
  markets,
  priceReports,
  reportVotes,
  userBadges,
  userReputationEvents,
  users,
} from "@/src/server/db/schema";

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

  const coverageStats = await db
    .select({
      marketsCovered: sql<number>`count(distinct ${priceReports.marketId})::int`,
      helpfulVotes: sql<number>`(
        select count(*)::int
        from ${reportVotes}
        inner join ${priceReports} as user_reports on ${reportVotes.reportId} = user_reports.id
        where user_reports.user_id = ${appUserId}
          and ${reportVotes.isHelpful} = true
      )`,
    })
    .from(priceReports)
    .where(eq(priceReports.userId, appUserId));

  const earnedBadges = await db
    .select({
      id: badges.id,
      name: badges.name,
      description: badges.description,
      awardedAt: userBadges.awardedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(badges.id, userBadges.badgeId))
    .where(eq(userBadges.userId, appUserId))
    .orderBy(desc(userBadges.awardedAt))
    .limit(12);

  const recentActivity = await db
    .select({
      reportId: priceReports.id,
      itemName: items.name,
      marketName: markets.name,
      status: priceReports.status,
      price: priceReports.price,
      currency: priceReports.currency,
      createdAt: priceReports.createdAt,
      helpfulVotes: sql<number>`(
        select count(*)::int
        from ${reportVotes}
        where ${reportVotes.reportId} = ${priceReports.id}
          and ${reportVotes.isHelpful} = true
      )`,
      reputationDelta: sql<number>`coalesce((
        select ${userReputationEvents.delta}
        from ${userReputationEvents}
        where ${userReputationEvents.userId} = ${appUserId}
          and ${userReputationEvents.reason} ilike ('%report #' || ${priceReports.id} || '%')
        order by ${userReputationEvents.createdAt} desc
        limit 1
      ), 0)`,
    })
    .from(priceReports)
    .innerJoin(items, eq(items.id, priceReports.itemId))
    .innerJoin(markets, eq(markets.id, priceReports.marketId))
    .where(eq(priceReports.userId, appUserId))
    .orderBy(desc(priceReports.createdAt))
    .limit(5);

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
      marketsCovered: coverageStats[0]?.marketsCovered ?? 0,
      helpfulVotes: coverageStats[0]?.helpfulVotes ?? 0,
    },
    badges: earnedBadges,
    recentActivity,
  });
}
