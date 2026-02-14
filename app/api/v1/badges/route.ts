import { desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { fail, ok } from "@/src/server/api/http";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { badges, userBadges } from "@/src/server/db/schema";

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

    // All badges that exist in the system
    const allBadges = await db
        .select({
            id: badges.id,
            name: badges.name,
            description: badges.description,
        })
        .from(badges)
        .orderBy(badges.id);

    // Badges earned by this user
    const earned = await db
        .select({
            badgeId: userBadges.badgeId,
            awardedAt: userBadges.awardedAt,
        })
        .from(userBadges)
        .where(eq(userBadges.userId, appUserId))
        .orderBy(desc(userBadges.awardedAt));

    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.awardedAt]));

    // Known badge definitions (even if not yet in DB)
    const knownBadges = [
        { name: "First Reporter", description: "Submitted your first price report", requirement: "Submit 1 report" },
        { name: "Trend Setter", description: "Submitted 10+ price reports", requirement: "Submit 10 reports" },
        { name: "Veteran Reporter", description: "Submitted 50+ price reports", requirement: "Submit 50 reports" },
        { name: "Accuracy Star", description: "10+ verified reports", requirement: "Get 10 reports verified" },
        { name: "Community Helper", description: "Received 20+ helpful votes", requirement: "Receive 20 helpful votes" },
    ];

    const result = knownBadges.map((known) => {
        const dbBadge = allBadges.find((b) => b.name === known.name);
        const awardedAt = dbBadge ? earnedMap.get(dbBadge.id) : undefined;
        return {
            name: known.name,
            description: known.description,
            requirement: known.requirement,
            earned: !!awardedAt,
            awardedAt: awardedAt ?? null,
        };
    });

    return ok({ badges: result });
}
