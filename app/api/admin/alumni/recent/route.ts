import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const recentAlumni = await db
      .collection("alumni")
      .find({})
      .sort({ "metadata.registrationDate": -1 })
      .limit(10)
      .toArray()

    return NextResponse.json(recentAlumni)
  } catch (error) {
    console.error("Error fetching recent alumni:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
