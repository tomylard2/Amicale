import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants";

// Étend les types d'Auth.js pour transporter nos champs métier
// (rôle, approbation, activation) dans la session et le token JWT.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isApproved: boolean;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    isApproved: boolean;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    isApproved: boolean;
    isActive: boolean;
  }
}
