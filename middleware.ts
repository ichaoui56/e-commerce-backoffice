import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Cache static assets for 1 year
  if (request.nextUrl.pathname.startsWith("/_next/static/") || request.nextUrl.pathname.startsWith("/_next/image/")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  }

  // Cache API responses for a shorter time
  if (request.nextUrl.pathname.startsWith("/api/files")) {
    response.headers.set("Cache-Control", "public, max-age=3600") // 1 hour
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/files/:path*"],
}
