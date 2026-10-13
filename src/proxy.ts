import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/cases", "/teams", "/pinboard", "/play"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept static file requests (images, audio, media)
  if (/\.(webp|png|jpg|jpeg|gif|svg|ico|mp3|wav|ogg|json)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const isProtected =
    protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) && pathname !== "/cases";
  if (isProtected) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
