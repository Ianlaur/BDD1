import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware - auth checks done in pages/API routes
export function middleware(request: NextRequest) {
  // Just pass through - authentication handled by server components and API routes
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
