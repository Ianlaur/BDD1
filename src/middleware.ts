import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware - doesn't import heavy dependencies
export function middleware(request: NextRequest) {
  // Let NextAuth handle auth on its own
  // This middleware just passes through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
