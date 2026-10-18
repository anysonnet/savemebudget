import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only (cookie present). Real authorization happens in
// requireUser() on each page and Server Action, close to the data.
export function proxy(request: NextRequest) {
  if (request.cookies.has("savemebudget_session")) return;

  // Behind the reverse proxy, request.url may carry the internal host; prefer the public one.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const target = host ? `${proto}://${host}/login` : new URL("/login", request.url);
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
