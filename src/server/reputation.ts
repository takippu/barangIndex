import { eq, sql } from "drizzle-orm";

import { db } from "@/src/server/db/client";
import {
    badges,
    priceReports,
    reportVotes,
    userBadges,
    userReputationEvents,
    users,
} from "@/src/server/db/schema";

/**
 * Awards (or deducts) reputation points for a user.
 * Inserts an event row for the audit trail and atomically updates users.reputation.
 */
export async function awardReputation(
    userId: number,
    delta: number,
    reason: string,
): Promise<void> {
    await db.insert(userReputationEvents).values({ userId, delta, reason });
    await db
        .update(users)
        .set({ reputation: sql`${users.reputation} + ${delta}`, updatedAt: new Date() })
        .where(eq(users.id, userId));
}

/** Badge definitions keyed by name with their unlock conditions. */
const BADGE_RULES: Array<{
    name: string;
    description: string;
    check: (stats: UserStats) => boolean;
}> = [
        {
            name: "First Reporter",
            description: "Submitted your first price report",
            check: (s) => s.reportCount >= 1,
        },
        {
            name: "Trend Setter",
            description: "Submitted 10+ price reports",
            check: (s) => s.reportCount >= 10,
        },
        {
            name: "Veteran Reporter",
            description: "Submitted 50+ price reports",
            check: (s) => s.reportCount >= 50,
        },
        {
            name: "Accuracy Star",
            description: "10+ verified reports",
            check: (s) => s.verifiedReportCount >= 10,
        },
        {
            name: "Community Helper",
            description: "Received 20+ helpful votes",
            check: (s) => s.helpfulVotesReceived >= 20,
        },
    ];

type UserStats = {
    reportCount: number;
    verifiedReportCount: number;
    helpfulVotesReceived: number;
};

/**
 * Checks badge unlock conditions and awards any missing badges.
 * Safe to call repeatedly — it will not duplicate badges.
 */
export async function checkAndAwardBadges(userId: number): Promise<void> {
    // Gather current stats
    const statsRows = await db
        .select({
            reportCount: users.reportCount,
            verifiedReportCount: users.verifiedReportCount,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!statsRows[0]) return;

    const helpfulRows = await db
        .select({
            count: sql<number>`count(*)::int`,
        })
        .from(reportVotes)
        .innerJoin(priceReports, eq(reportVotes.reportId, priceReports.id))
        .where(
            sql`${priceReports.userId} = ${userId} and ${reportVotes.isHelpful} = true`,
        );

    const stats: UserStats = {
        reportCount: statsRows[0].reportCount,
        verifiedReportCount: statsRows[0].verifiedReportCount,
        helpfulVotesReceived: helpfulRows[0]?.count ?? 0,
    };

    // Get already-earned badge names
    const earnedRows = await db
        .select({ name: badges.name })
        .from(userBadges)
        .innerJoin(badges, eq(badges.id, userBadges.badgeId))
        .where(eq(userBadges.userId, userId));

    const earnedSet = new Set(earnedRows.map((r) => r.name));

    for (const rule of BADGE_RULES) {
        if (earnedSet.has(rule.name) || !rule.check(stats)) continue;

        // Ensure the badge definition row exists (upsert by name)
        const badgeRow = await db
            .insert(badges)
            .values({ name: rule.name, description: rule.description })
            .onConflictDoNothing()
            .returning({ id: badges.id });

        let badgeId: number;
        if (badgeRow[0]) {
            badgeId = badgeRow[0].id;
        } else {
            const existing = await db
                .select({ id: badges.id })
                .from(badges)
                .where(eq(badges.name, rule.name))
                .limit(1);
            if (!existing[0]) continue;
            badgeId = existing[0].id;
        }

        await db.insert(userBadges).values({ userId, badgeId });
    }
}
