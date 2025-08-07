// /app/api/alumni/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const alumni = await db.collection("alumni").find({}).toArray();
    return NextResponse.json(alumni);
  } catch (error) {
    console.error("Failed to fetch alumni:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
