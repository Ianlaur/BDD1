import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/admin",
  "/associations/*/manage",
  "/associations/*/edit",
  "/associations/*/settings",
  "/associations/*/erp",
];

// Public routes that don't require auth
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/associations",
  "/events",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => {
    const pattern = route.replace("*", "[^/]+");
    return new RegExp(`^${pattern}`).test(pathname);
  });
  
  // If protected, verify authentication
  if (isProtectedRoute) {
    const session = await auth();
    
    if (!session?.user) {
      // Redirect to signin with callback URL
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
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
