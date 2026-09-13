import { NextResponse, type NextRequest } from "next/server";

/**
 * Role-based route guarding (PRD §9.5) via an HTTP-only session cookie set
 * by the Go backend on login. This proxy only checks for the cookie's
 * presence/role claim — it does not verify the session server-side; real
 * verification happens on each API call via lib/api/client.ts credentials.
 *
 * NOTE: cookie name/shape is a placeholder until the Go backend's auth
 * cookie contract is confirmed. Named `proxy.ts` per Next.js 16's renamed
 * convention (formerly `middleware.ts`) — see AGENTS.md.
 */
const SESSION_COOKIE = "pharmalink_session";
const ROLE_COOKIE = "pharmalink_role";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];
/**
 * Only truly personal routes require a session. Search and the pharmacy/
 * medicine detail pages are intentionally public — the landing page's hero
 * search and Pages 6/7's "also serves anonymous search" requirement
 * (prd.md §7.1) both depend on browsing working with no account. `/profile`
 * added with Page 11 — it reads/writes the signed-in user's own account, so
 * (unlike Search) it has no meaningful anonymous state to show. `/reminders`
 * added with Page 12 — same reasoning as `/profile`, personal data with no
 * anonymous state.
 */
const PATIENT_ROUTES = ["/home", "/profile", "/reminders"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  const isAuthenticated = Boolean(sessionToken);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isPatientRoute = PATIENT_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthenticated && isAuthRoute) {
    const destination = role === "patient" ? "/home" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!isAuthenticated && isPatientRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isPatientRoute && role && role !== "patient") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
