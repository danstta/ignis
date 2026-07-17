import { NextResponse, type NextRequest } from "next/server";
import { hasSessionCookie } from "@/lib/auth/edge";

/**
 * Optimistic auth gate (Next 16 renamed Middleware -> Proxy). Checks session
 * cookie presence only — no DB call on this hot path — so sensitive reads and
 * mutations must still re-check via `requireUser()` server-side. Public paths
 * (login/signup, auth + webhook APIs, static files) are excluded via the
 * matcher below.
 */
export function proxy(req: NextRequest) {
  if (hasSessionCookie(req)) return NextResponse.next();

  // Anonymous visitors hitting the root see the public landing page (URL
  // stays "/"); authenticated users fall through to the dashboard above.
  if (req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/landing-page";
    return NextResponse.rewrite(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Match everything except: auth API, editor font assets, image proxy assets,
  // public webhook ingest
  // (api/hooks), the Inngest serve endpoint (api/inngest — Cloud/the dev server
  // POST/PUT here with no session cookie and verify their own signing key),
  // the public waitlist signup API (api/waitlist),
  // the login/signup pages, the public landing page, Next internals, and any
  // path with a file extension (static assets, /uploads/*.png).
  matcher: [
    "/((?!api/auth|api/editor-fonts|api/location-images|api/drive-images|api/hooks|api/inngest|api/waitlist|login|signup|landing-page|_next|.*\\..*).*)",
  ],
};
