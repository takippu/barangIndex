import { and, asc, eq, ilike } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { items } from "@/src/server/db/schema";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = parseQuery(querySchema, query);
  if (parsed.error) {
    return parsed.error;
  }

  const filters = [eq(items.isActive, true)];

  if (parsed.data.q) {
    filters.push(ilike(items.name, `%${parsed.data.q}%`));
  }

  if (parsed.data.category) {
    filters.push(eq(items.category, parsed.data.category));
  }

  const rows = await db
    .select({
      id: items.id,
      slug: items.slug,
      name: items.name,
      category: items.category,
      defaultUnit: items.defaultUnit,
      currency: items.currency,
    })
    .from(items)
    .where(and(...filters))
    .orderBy(asc(items.name))
    .limit(parsed.data.limit);

  return ok(rows);
}
