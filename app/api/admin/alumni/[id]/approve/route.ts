import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendAlumniApprovalNotification } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reason } = await request.json()
    const { db } = await connectToDatabase()

    const alumni = await db.collection("alumni").findOne({
      _id: new ObjectId(params.id),
    })

    if (!alumni) {
      return NextResponse.json({ error: "Alumni not found" }, { status: 404 })
    }

    // Update alumni status
    await db.collection("alumni").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          "metadata.status": "approved",
          "metadata.lastUpdated": new Date(),
          "metadata.approvalReason": reason || "Application approved",
        },
      },
    )

    // Send approval email
    await sendAlumniApprovalNotification({
      firstName: alumni.personalInfo.firstName,
      lastName: alumni.personalInfo.lastName,
      email: alumni.personalInfo.email,
      studentId: alumni.studentId,
      verificationCode: alumni.verificationCode,
      graduationYear: alumni.academicInfo.graduationYear,
      school: alumni.academicInfo.school,
      degree: alumni.academicInfo.degree,
    })

    return NextResponse.json({ message: "Alumni approved successfully" })
  } catch (error) {
    console.error("Error approving alumni:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
