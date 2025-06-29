import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const stats = await db
      .collection("alumni")
      .aggregate([
        {
          $group: {
            _id: "$metadata.status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const total = await db.collection("alumni").countDocuments()

    const result = {
      total,
      approved: stats.find((s) => s._id === "approved")?.count || 0,
      pending: stats.find((s) => s._id === "pending")?.count || 0,
      rejected: stats.find((s) => s._id === "rejected")?.count || 0,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching alumni stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
