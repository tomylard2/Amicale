"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/lib/actions/auth";

const initialState: RegisterState = {};

const inputClass =
  "w-full h-11 rounded-lg bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus-visible:outline-2 focus-visible:outline-primary";
const labelClass = "block text-sm font-medium text-slate-200 mb-1";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1 text-xs text-red-300">{messages[0]}</p>;
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl" aria-hidden>
          ✅
        </div>
        <h1 className="text-lg font-semibold text-white">
          Compte créé avec succès
        </h1>
        <p className="text-sm text-slate-300">
          Votre compte a bien été enregistré. Il doit maintenant être{" "}
          <strong className="text-white">approuvé par un administrateur</strong>{" "}
          avant que vous puissiez réserver du matériel. Vous serez informé par
          e-mail dès son activation.
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
        Créer un compte
      </h1>

      {state.error && (
        <p className="rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-sm px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="prenom">
            Prénom
          </label>
          <input id="prenom" name="prenom" className={inputClass} required />
          <FieldError messages={state.fieldErrors?.prenom} />
        </div>
        <div>
          <label className={labelClass} htmlFor="nom">
            Nom
          </label>
          <input id="nom" name="nom" className={inputClass} required />
          <FieldError messages={state.fieldErrors?.nom} />
        </div>
      </div>

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

      <div>
        <label className={labelClass} htmlFor="telephone">
          Téléphone <span className="text-slate-400">(facultatif)</span>
        </label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          autoComplete="tel"
          placeholder="06 12 34 56 78"
          className={inputClass}
        />
        <FieldError messages={state.fieldErrors?.telephone} />
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          Mot de passe
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
        {pending ? "Création..." : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-slate-300">
        Déjà un compte ?{" "}
        <Link
          href="/"
          className="text-white underline underline-offset-2 hover:text-primary"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
