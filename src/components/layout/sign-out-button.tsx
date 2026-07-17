"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "text-sm text-slate-300 hover:text-white transition-colors"
      }
    >
      Déconnexion
    </button>
  );
}
