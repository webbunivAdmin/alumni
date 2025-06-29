import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/alumni/login",
    "/admin/login",
    "/api/alumni/request-otp",
    "/api/alumni/verify-otp",
    "/api/admin/login",
  ]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Alumni routes protection
  if (pathname.startsWith("/alumni/")) {
    const alumniSession = request.cookies.get("alumni_session")?.value

    if (!alumniSession) {
      return NextResponse.redirect(new URL("/alumni/login", request.url))
    }

    try {
      const sessionData = JSON.parse(alumniSession)
      if (!sessionData.studentId || !sessionData.verificationCode) {
        return NextResponse.redirect(new URL("/alumni/login", request.url))
      }

      // Verify session is still valid
      const { db } = await connectToDatabase()
      const alumni = await db.collection("alumni").findOne({
        studentId: sessionData.studentId,
        verificationCode: sessionData.verificationCode,
        "metadata.status": "approved",
      })

      if (!alumni) {
        const response = NextResponse.redirect(new URL("/alumni/login", request.url))
        response.cookies.delete("alumni_session")
        return response
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/alumni/login", request.url))
    }
  }

  // Admin routes protection
  if (pathname.startsWith("/admin/")) {
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    try {
      const sessionData = JSON.parse(adminSession)
      if (!sessionData.id || !sessionData.identifier) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }

      // Verify admin session is still valid
      const { db } = await connectToDatabase()
      const admin = await db.collection("admins").findOne({
        _id: sessionData.id,
        identifier: sessionData.identifier,
      })

      if (!admin) {
        const response = NextResponse.redirect(new URL("/admin/login", request.url))
        response.cookies.delete("admin_session")
        return response
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // API routes protection
  if (pathname.startsWith("/api/admin/") && !pathname.includes("/login")) {
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  if (
    pathname.startsWith("/api/alumni/") &&
    !pathname.includes("/login") &&
    !pathname.includes("/request-otp") &&
    !pathname.includes("/verify-otp")
  ) {
    const alumniSession = request.cookies.get("alumni_session")?.value

    if (!alumniSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
