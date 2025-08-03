
import { NextResponse } from "next/server"

async function middleware(request: any) {

  return NextResponse.next()
}

export default middleware

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}