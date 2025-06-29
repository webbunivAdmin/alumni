import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { electionId, votes } = await request.json()
    const { db } = await connectToDatabase()

    // Get alumni session from cookie
    const alumniSession = request.cookies.get("alumni_session")?.value
    if (!alumniSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionData = JSON.parse(alumniSession)
    const studentId = sessionData.studentId

    // Check if alumni has already voted in this election
    const existingVote = await db.collection("votes").findOne({
      electionId,
      alumniId: studentId,
    })

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted in this election" }, { status: 400 })
    }

    // Verify election is active
    const election = await db.collection("elections").findOne({ _id: electionId })
    if (!election || election.status !== "active") {
      return NextResponse.json({ error: "Election is not active" }, { status: 400 })
    }

    // Check if voting is within the allowed time frame
    const now = new Date()
    const startDate = new Date(election.startDate)
    const endDate = new Date(election.endDate)

    if (now < startDate || now > endDate) {
      return NextResponse.json({ error: "Voting is not currently allowed" }, { status: 400 })
    }

    // Submit votes
    const voteDocuments = Object.entries(votes).map(([position, candidateId]) => ({
      electionId,
      alumniId: studentId,
      candidateId,
      position,
      timestamp: new Date(),
      ipAddress: request.ip || request.headers.get("x-forwarded-for") || "unknown",
    }))

    await db.collection("votes").insertMany(voteDocuments)

    // Update candidate vote counts
    for (const [position, candidateId] of Object.entries(votes)) {
      await db.collection("candidates").updateOne({ _id: candidateId }, { $inc: { votes: 1 } })
    }

    // Update election total votes
    await db.collection("elections").updateOne({ _id: electionId }, { $inc: { totalVotes: 1 } })

    return NextResponse.json({ message: "Votes submitted successfully" })
  } catch (error) {
    console.error("Error submitting votes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
