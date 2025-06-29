import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const candidates = await db.collection("candidates").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(candidates)
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const candidateData = await request.json()
    const { db } = await connectToDatabase()

    const candidate = {
      ...candidateData,
      votes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("candidates").insertOne(candidate)

    return NextResponse.json({
      message: "Candidate added successfully",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error adding candidate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
