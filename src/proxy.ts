import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user ? (req.auth.user as any).role : null;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isUserRoute =
    nextUrl.pathname.startsWith("/profil") ||
    nextUrl.pathname.startsWith("/kyc") ||
    nextUrl.pathname.startsWith("/transaksi") ||
    nextUrl.pathname.startsWith("/wishlist") ||
    nextUrl.pathname.startsWith("/notifikasi");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      let from = nextUrl.pathname;
      if (nextUrl.search) {
        from += nextUrl.search;
      }
      return Response.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, nextUrl)
      );
    }
    if (userRole !== "admin") {
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (isUserRoute) {
    if (!isLoggedIn) {
      let from = nextUrl.pathname;
      if (nextUrl.search) {
        from += nextUrl.search;
      }
      return Response.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, nextUrl)
      );
    }
    return;
  }

  return;
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/profil/:path*",
    "/kyc/:path*",
    "/transaksi/:path*",
    "/wishlist/:path*",
    "/notifikasi/:path*",
    "/login",
    "/register",
  ],
};
