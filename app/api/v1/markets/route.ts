import { and, asc, eq, ilike } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { markets, regions } from "@/src/server/db/schema";

const querySchema = z.object({
  regionId: z.coerce.number().int().positive().optional(),
  q: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = parseQuery(querySchema, query);
  if (parsed.error) {
    return parsed.error;
  }

  const filters = [eq(markets.isActive, true)];
  if (parsed.data.regionId) {
    filters.push(eq(markets.regionId, parsed.data.regionId));
  }

  if (parsed.data.q) {
    filters.push(ilike(markets.name, `%${parsed.data.q}%`));
  }

  const rows = await db
    .select({
      id: markets.id,
      name: markets.name,
      regionId: markets.regionId,
      regionName: regions.name,
      country: regions.country,
      latitude: markets.latitude,
      longitude: markets.longitude,
    })
    .from(markets)
    .innerJoin(regions, eq(markets.regionId, regions.id))
    .where(and(...filters))
    .orderBy(asc(markets.name));

  return ok(rows);
}
