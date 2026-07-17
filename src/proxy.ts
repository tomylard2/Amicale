import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Protection des routes (ancien "middleware", renommé "proxy" dans Next.js 16).
// Utilise la config "edge-safe" (sans accès base de données).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const isApproved = session?.user?.isApproved;
  const path = nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isMemberRoute = path.startsWith("/espace");

  // Non connecté : redirection vers la page de connexion (accueil)
  if ((isAdminRoute || isMemberRoute) && !isLoggedIn) {
    const url = new URL("/", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Zone admin réservée aux administrateurs
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/espace", nextUrl));
  }

  // Membre connecté mais non approuvé : accès limité à la page d'attente
  if (
    isMemberRoute &&
    isLoggedIn &&
    role !== "ADMIN" &&
    !isApproved &&
    path !== "/espace/en-attente"
  ) {
    return NextResponse.redirect(new URL("/espace/en-attente", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Ne s'exécute que sur les zones protégées
  matcher: ["/espace/:path*", "/admin/:path*"],
};
