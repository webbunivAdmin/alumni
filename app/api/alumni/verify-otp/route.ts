import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyOTP } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { studentId, verificationCode, otp } = await request.json()

    if (!studentId || !verificationCode || !otp) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const isValidOTP = await verifyOTP(studentId, verificationCode, otp)

    if (!isValidOTP) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get alumni data
    const alumni = await db.collection("alumni").findOne({
      studentId,
      verificationCode,
      "metadata.status": "approved",
    })

    if (!alumni) {
      return NextResponse.json({ error: "Alumni not found" }, { status: 404 })
    }

    // Return alumni data for session
    return NextResponse.json({
      message: "Login successful",
      alumni: {
        studentId: alumni.studentId,
        verificationCode: alumni.verificationCode,
        personalInfo: alumni.personalInfo,
        academicInfo: alumni.academicInfo,
        professionalInfo: alumni.professionalInfo,
        metadata: alumni.metadata,
      },
    })
  } catch (error) {
    console.error("Error in verify-otp:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
