import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const alumni = await db.collection("alumni").find({}).sort({ "metadata.registrationDate": -1 }).toArray()

    return NextResponse.json(alumni)
  } catch (error) {
    console.error("Error fetching alumni:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
