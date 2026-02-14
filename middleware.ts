import { NextRequest, NextResponse } from "next/server";

// Paths that require authentication
const protectedPaths = [
  "/home",
  "/submit",
  "/profile",
  "/alerts",
  "/price-index",
  "/search",
  "/reports",
  "/badges",
];

// Paths that are always public (no auth needed)
const publicPaths = [
  "/",
  "/login",
  "/onboarding",
  "/markets",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  // Check if path requires auth
  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path));
  
  // Markets detail pages require auth
  const isMarketsDetail = pathname.startsWith("/markets/") && pathname !== "/markets";
  
  if (!requiresAuth && !isMarketsDetail) {
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (sessionToken) {
    return NextResponse.next();
  }

  // Redirect to login with return URL
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
