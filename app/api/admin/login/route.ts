import { type NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password are required" }, { status: 400 })
    }

    const admin = await verifyAdmin(identifier, password)

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      message: "Login successful",
      admin,
    })
  } catch (error) {
    console.error("Error in admin login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
