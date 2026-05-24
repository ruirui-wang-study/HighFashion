import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/lib/admin-constants";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(adminSessionCookieName)?.value;

  const headers = new Headers(request.headers);
  headers.set("x-pulsegear-pathname", pathname);

  if (pathname.startsWith("/admin")) {
    if (!token && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next({
    request: { headers },
  });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
