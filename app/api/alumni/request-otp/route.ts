import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { createOTPSession } from "@/lib/auth"
import { sendOTPEmail } from "@/lib/email-otp"

export async function POST(request: NextRequest) {
  try {
    const { studentId, verificationCode } = await request.json()

    if (!studentId || !verificationCode) {
      return NextResponse.json({ error: "Student ID and verification code are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verify alumni exists and is approved
    const alumni = await db.collection("alumni").findOne({
      studentId,
      verificationCode,
      "metadata.status": "approved",
    })

    if (!alumni) {
      return NextResponse.json({ error: "Invalid credentials or account not approved" }, { status: 401 })
    }

    // Generate and send OTP
    const otp = await createOTPSession(studentId, verificationCode)

    await sendOTPEmail(alumni.personalInfo.email, alumni.personalInfo.firstName, otp)

    return NextResponse.json({
      message: "OTP sent successfully",
      email: alumni.personalInfo.email.replace(/(.{2}).*(@.*)/, "$1***$2"),
    })
  } catch (error) {
    console.error("Error in request-otp:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
