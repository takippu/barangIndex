import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/src/server/api/http";
import { parseQuery } from "@/src/server/api/validation";
import { db } from "@/src/server/db/client";
import { itemVariants, items } from "@/src/server/db/schema";

const paramsSchema = z.object({
  itemId: z.coerce.number().int().positive(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ itemId: string }> },
) {
  const params = await context.params;
  const parsed = parseQuery(paramsSchema, params);
  if (parsed.error) {
    return parsed.error;
  }

  const itemRows = await db
    .select({
      id: items.id,
      slug: items.slug,
      name: items.name,
      category: items.category,
      defaultUnit: items.defaultUnit,
      currency: items.currency,
      isActive: items.isActive,
    })
    .from(items)
    .where(eq(items.id, parsed.data.itemId))
    .limit(1);

  const item = itemRows[0];
  if (!item || !item.isActive) {
    return fail("NOT_FOUND", "Item not found", 404);
  }

  const variants = await db
    .select({
      id: itemVariants.id,
      name: itemVariants.name,
      sku: itemVariants.sku,
    })
    .from(itemVariants)
    .where(eq(itemVariants.itemId, item.id));

  return ok({ ...item, variants });
}
