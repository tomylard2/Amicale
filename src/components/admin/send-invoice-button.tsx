"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { sendInvoiceEmail } from "@/lib/actions/invoice";

export function SendInvoiceButton({
  id,
  alreadySent,
}: {
  id: string;
  alreadySent: boolean;
}) {
  const [state, formAction, pending] = useActionState(sendInvoiceEmail, {});

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" disabled={pending}>
          {pending
            ? "Envoi en cours..."
            : alreadySent
              ? "Renvoyer par e-mail"
              : "Envoyer par e-mail"}
        </Button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-danger">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-2 text-sm text-success">Facture envoyée avec succès.</p>
      )}
    </div>
  );
}
