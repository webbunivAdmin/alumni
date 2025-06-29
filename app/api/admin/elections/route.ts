import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const elections = await db.collection("elections").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(elections)
  } catch (error) {
    console.error("Error fetching elections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const electionData = await request.json()
    const { db } = await connectToDatabase()

    const election = {
      ...electionData,
      status: "draft",
      totalVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("elections").insertOne(election)

    return NextResponse.json({
      message: "Election created successfully",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating election:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
