// src/middleware.js

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;


  // Public API routes that don't need auth
  const publicApiPaths = ["/api/auth"];
  if (publicApiPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access root, redirect to dashboard
  if (pathname === "/" && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (err) {
      // Invalid token, allow access to login page
      return NextResponse.next();
    }
  }

  // Protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};