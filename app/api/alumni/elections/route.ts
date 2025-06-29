import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const elections = await db
      .collection("elections")
      .find({
        status: { $in: ["active", "completed"] },
      })
      .sort({ startDate: -1 })
      .toArray()

    return NextResponse.json(elections)
  } catch (error) {
    console.error("Error fetching elections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
