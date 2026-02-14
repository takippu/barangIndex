import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseJson, parseQuery } from "@/src/server/api/validation";
import { resolveAppUserId } from "@/src/server/auth/app-user";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { adminAuditLogs, priceReports } from "@/src/server/db/schema";

const paramsSchema = z.object({
  reportId: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  message: z.string().trim().min(1).max(500),
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
  const parsedParams = parseQuery(paramsSchema, params);
  if (parsedParams.error) {
    return parsedParams.error;
  }

  const parsedBody = await parseJson(bodySchema, request);
  if (parsedBody.error) {
    return parsedBody.error;
  }

  const report = await db
    .select({ id: priceReports.id, status: priceReports.status })
    .from(priceReports)
    .where(eq(priceReports.id, parsedParams.data.reportId))
    .limit(1);

  if (!report[0]) {
    return fail("NOT_FOUND", "Report not found", 404);
  }

  const appUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });
  if (!appUserId) {
    return fail("UNAUTHENTICATED", "Could not resolve app user", 401);
  }

  const inserted = await db
    .insert(adminAuditLogs)
    .values({
      adminId: appUserId,
      action: "comment",
      entityType: "price_report_comment",
      entityId: parsedParams.data.reportId,
      payload: { message: parsedBody.data.message },
    })
    .returning({
      id: adminAuditLogs.id,
      createdAt: adminAuditLogs.createdAt,
    });

  return ok({
    id: inserted[0].id,
    message: parsedBody.data.message,
    createdAt: inserted[0].createdAt,
  }, 201);
}
