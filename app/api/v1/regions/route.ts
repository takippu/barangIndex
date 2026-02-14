
import { NextResponse } from "next/server";
import { db } from "@/src/server/db/client";
import { regions } from "@/src/server/db/schema";

export async function GET() {
    try {
        const data = await db.select().from(regions);
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Failed to fetch regions", error);
        return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 });
    }
}
