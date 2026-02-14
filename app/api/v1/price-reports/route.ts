import { and, eq, gte, lte } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseJson } from "@/src/server/api/validation";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { markets, priceReports } from "@/src/server/db/schema";

const payloadSchema = z.object({
  itemId: z.number().int().positive(),
  marketId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  price: z.number().positive(),
  reportedAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session?.user) {
    return fail("UNAUTHENTICATED", "Authentication required", 401);
  }

  const parsed = await parseJson(payloadSchema, request);
  if (parsed.error) {
    return parsed.error;
  }

  const market = await db
    .select({ id: markets.id, regionId: markets.regionId })
    .from(markets)
    .where(eq(markets.id, parsed.data.marketId))
    .limit(1);

  if (!market[0]) {
    return fail("BAD_REQUEST", "Invalid marketId", 400);
  }

  const reporterUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });

  const reportedAt = parsed.data.reportedAt ? new Date(parsed.data.reportedAt) : new Date();
  const startOfHour = new Date(reportedAt);
  startOfHour.setMinutes(0, 0, 0);
  const endOfHour = new Date(reportedAt);
  endOfHour.setMinutes(59, 59, 999);

  if (reporterUserId) {
    const duplicate = await db
      .select({ id: priceReports.id })
      .from(priceReports)
      .where(
        and(
          eq(priceReports.userId, reporterUserId),
          eq(priceReports.itemId, parsed.data.itemId),
          eq(priceReports.marketId, parsed.data.marketId),
          gte(priceReports.reportedAt, startOfHour),
          lte(priceReports.reportedAt, endOfHour),
        ),
      )
      .limit(1);

    if (duplicate[0]) {
      return fail("CONFLICT", "Duplicate report in the same hour", 409);
    }
  }

  const inserted = await db
    .insert(priceReports)
    .values({
      itemId: parsed.data.itemId,
      variantId: parsed.data.variantId,
      marketId: parsed.data.marketId,
      regionId: market[0].regionId,
      userId: reporterUserId,
      price: parsed.data.price.toFixed(2),
      reportedAt,
    })
    .returning({ id: priceReports.id, status: priceReports.status, reportedAt: priceReports.reportedAt });

  return ok(inserted[0], 201);
}
