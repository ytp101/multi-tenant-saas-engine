import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prevent routing loops and let dashboard requests pass through
  if (pathname === "/dashboard") {
    return NextResponse.next();
  }

  // Redirect all other matching routes directly to the mock dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

// Config to run the proxy on all paths except static assets, favicon, etc.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|favicon.svg|sitemap.xml|robots.txt).*)",
  ],
};
