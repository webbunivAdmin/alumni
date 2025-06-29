import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function generateOTP(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createOTPSession(studentId: string, verificationCode: string): Promise<string> {
  try {
    const { db } = await connectToDatabase()

    // Verify alumni exists
    const alumni = await db.collection("alumni").findOne({
      studentId,
      verificationCode,
      "metadata.status": "approved",
    })

    if (!alumni) {
      throw new Error("Invalid credentials or account not approved")
    }

    // Generate OTP
    const otp = await generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP session
    await db.collection("otp_sessions").insertOne({
      studentId,
      verificationCode,
      otp,
      expiresAt,
      used: false,
      createdAt: new Date(),
    })

    return otp
  } catch (error) {
    console.error("Error creating OTP session:", error)
    throw error
  }
}

export async function verifyOTP(studentId: string, verificationCode: string, otp: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    const session = await db.collection("otp_sessions").findOne({
      studentId,
      verificationCode,
      otp,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return false
    }

    // Mark OTP as used
    await db.collection("otp_sessions").updateOne({ _id: session._id }, { $set: { used: true } })

    return true
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return false
  }
}

export async function verifyAdmin(identifier: string, password: string): Promise<any> {
  try {
    const { db } = await connectToDatabase()

    const admin = await db.collection("admins").findOne({ identifier })

    if (!admin) {
      return null
    }

    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) {
      return null
    }

    // Update last login
    await db.collection("admins").updateOne({ _id: admin._id }, { $set: { lastLogin: new Date() } })

    return {
      id: admin._id.toString(),
      identifier: admin.identifier,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    }
  } catch (error) {
    console.error("Error verifying admin:", error)
    return null
  }
}
