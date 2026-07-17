import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/constants";

/**
 * Configuration de base d'Auth.js, compatible avec le runtime "edge"
 * (utilisée par le middleware de protection des routes). Elle ne contient
 * AUCUN accès base de données ni bcrypt — ceux-ci sont ajoutés dans auth.ts.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/", // la page d'accueil est l'écran de connexion
  },
  providers: [], // renseignés dans auth.ts
  callbacks: {
    // Recopie nos champs métier depuis l'utilisateur vers le token JWT
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isApproved = user.isApproved;
        token.isActive = user.isActive;
      }
      return token;
    },
    // Expose ces champs dans la session lisible par l'application
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.isApproved = token.isApproved as boolean;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
