"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function IconUser() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }

    // Redirection : on honore la page demandée (callbackUrl) si présente,
    // sinon on oriente selon le rôle (admin -> /admin, membre -> /espace).
    if (callbackUrl && callbackUrl.startsWith("/")) {
      router.push(callbackUrl);
    } else {
      const session = await getSession();
      router.push(session?.user?.role === "ADMIN" ? "/admin" : "/espace");
    }
    router.refresh();
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      {error && (
        <p className="rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-sm px-3 py-2">
          {error}
        </p>
      )}

      {/* Champ e-mail */}
      <div className="flex items-center rounded-lg bg-white overflow-hidden">
        <span className="flex items-center justify-center w-11 h-11 text-slate-400 shrink-0">
          <IconUser />
        </span>
        <input
          type="email"
          name="email"
          placeholder="e-mail"
          autoComplete="email"
          required
          className="flex-1 h-11 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
      </div>

      {/* Champ mot de passe */}
      <div className="flex items-center rounded-lg bg-white overflow-hidden">
        <span className="flex items-center justify-center w-11 h-11 text-slate-400 shrink-0">
          <IconLock />
        </span>
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          autoComplete="current-password"
          required
          className="flex-1 h-11 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
      </div>

      {/* Liens + bouton */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/mot-de-passe-oublie"
            className="text-slate-200 hover:text-white underline underline-offset-2"
          >
            Mot de passe oublié
          </Link>
          <Link
            href="/inscription"
            className="text-slate-200 hover:text-white underline underline-offset-2"
          >
            Créer un compte
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-primary text-white px-5 h-10 text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Connexion"}
        </button>
      </div>
    </form>
  );
}
