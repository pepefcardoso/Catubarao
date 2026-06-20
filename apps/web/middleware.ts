import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  
  const { data: session } = await betterFetch<any>(
    "/api/auth/get-session",
    {
      baseURL: apiUrl,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  const url = request.nextUrl.clone();
  
  // Protect member routes
  if (url.pathname.startsWith("/dashboard")) {
    if (!session) {
      url.pathname = "/sign-in"; // Adjust according to your sign-in path
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes
  if (url.pathname.startsWith("/admin")) {
    if (!session) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    if (session.user.role !== "ADMIN") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
