import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and public assets
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/login")
  ) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
