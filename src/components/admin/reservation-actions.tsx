"use client";

import { useActionState } from "react";
import { confirmReservation, deleteReservation } from "@/lib/actions/admin-reservations";

export function ConfirmReservationButton({ id }: { id: string }) {
  return (
    <form action={confirmReservation}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium bg-success text-white hover:bg-green-700 transition-colors"
      >
        Accepter
      </button>
    </form>
  );
}

export function DeleteReservationButton({ id }: { id: string }) {
  const [state, formAction] = useActionState(deleteReservation, {});

  return (
    <div>
      <form
        action={formAction}
        onSubmit={(e) => {
          if (
            !confirm(
              "Supprimer définitivement cette réservation ? Cette action est irréversible.",
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="text-sm text-danger hover:underline">
          Supprimer
        </button>
      </form>
      {state.error && <p className="mt-1 text-xs text-danger">{state.error}</p>}
    </div>
  );
}
