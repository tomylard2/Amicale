"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  resetPassword,
  type ResetPasswordState,
} from "@/lib/actions/password-reset";

const initialState: ResetPasswordState = {};

const inputClass =
  "w-full h-11 rounded-lg bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus-visible:outline-2 focus-visible:outline-primary";
const labelClass = "block text-sm font-medium text-slate-200 mb-1";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1 text-xs text-red-300">{messages[0]}</p>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialState);

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl" aria-hidden>
          ✅
        </div>
        <h1 className="text-lg font-semibold text-white">
          Mot de passe mis à jour
        </h1>
        <p className="text-sm text-slate-300">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de
          passe.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg border border-primary text-white px-5 h-10 leading-10 text-sm font-semibold hover:bg-primary transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <h1 className="text-center text-lg font-semibold text-white mb-2">
        Choisir un nouveau mot de passe
      </h1>

      {state.error && (
        <p className="rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-sm px-3 py-2">
          {state.error}
        </p>
      )}

      <input type="hidden" name="token" value={token} />

      <div>
        <label className={labelClass} htmlFor="password">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          required
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>

      <div>
        <label className={labelClass} htmlFor="confirmPassword">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          required
        />
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary hover:bg-primary-hover text-white h-11 text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : "Valider"}
      </button>
    </form>
  );
}
