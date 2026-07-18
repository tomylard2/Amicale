"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type RequestResetState,
} from "@/lib/actions/password-reset";

const initialState: RequestResetState = {};

const inputClass =
  "w-full h-11 rounded-lg bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus-visible:outline-2 focus-visible:outline-primary";
const labelClass = "block text-sm font-medium text-slate-200 mb-1";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1 text-xs text-red-300">{messages[0]}</p>;
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl" aria-hidden>
          ✅
        </div>
        <h1 className="text-lg font-semibold text-white">E-mail envoyé</h1>
        <p className="text-sm text-slate-300">
          Si un compte existe avec cette adresse, un lien de réinitialisation
          vient de lui être envoyé. Vérifiez votre boîte de réception (et vos
          spams).
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg border border-primary text-white px-5 h-10 leading-10 text-sm font-semibold hover:bg-primary transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <h1 className="text-center text-lg font-semibold text-white mb-2">
        Mot de passe oublié
      </h1>
      <p className="text-sm text-slate-300 text-center mb-2">
        Indiquez votre adresse e-mail, nous vous enverrons un lien pour
        choisir un nouveau mot de passe.
      </p>

      <div>
        <label className={labelClass} htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          required
        />
        <FieldError messages={state.fieldErrors?.email} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary hover:bg-primary-hover text-white h-11 text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {pending ? "Envoi..." : "Envoyer le lien"}
      </button>

      <p className="text-center text-sm text-slate-300">
        <Link
          href="/"
          className="text-white underline underline-offset-2 hover:text-primary"
        >
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
