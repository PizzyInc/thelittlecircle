import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof supabaseResponse.cookies.set>[2] }[]) {
          const domain = process.env.NODE_ENV === "production" ? ".thelittlecircle.com" : undefined;
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, ...(domain ? { domain } : {}) })
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  const isAdminSubdomain = hostname.startsWith("admin.");

  // Rewrite admin.thelittlecircle.com → /admin/... (skip /login so it serves the real login page)
  if (isAdminSubdomain && !pathname.startsWith("/admin") && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin" + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }

  // Protect /dashboard, /settings, and /admin routes
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");

  if (isProtected && !user) {
    // On admin subdomain: redirect to login on the same subdomain
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Admin-only gate — only allowlisted emails can access /admin
  if (pathname.startsWith("/admin") && user) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? "")) {
      return NextResponse.redirect("https://www.thelittlecircle.com/");
    }
  }

  // Redirect logged-in users away from login/signup
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    // On admin subdomain, send to /admin after login
    url.pathname = isAdminSubdomain ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
