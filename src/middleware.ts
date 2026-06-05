import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminPage && request.nextUrl.pathname !== "/admin/login") {
    const cookie = request.cookies.get("admin_session");
    if (cookie?.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
