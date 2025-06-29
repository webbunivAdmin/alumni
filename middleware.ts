import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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
    "/api/uploadthing",
  ]

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
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
        const response = NextResponse.redirect(new URL("/alumni/login", request.url))
        response.cookies.delete("alumni_session")
        return response
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL("/alumni/login", request.url))
      response.cookies.delete("alumni_session")
      return response
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
        const response = NextResponse.redirect(new URL("/admin/login", request.url))
        response.cookies.delete("admin_session")
        return response
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete("admin_session")
      return response
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/uploadthing (uploadthing routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/uploadthing|_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
