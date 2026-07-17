"use client";

import { cancelReservation } from "@/lib/actions/reservation";

export function CancelReservationButton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <form
      action={cancelReservation}
      onSubmit={(e) => {
        if (!confirm("Annuler cette réservation ? Cette action est définitive.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={
          className ??
          "inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium bg-danger text-white hover:bg-red-700 transition-colors"
        }
      >
        Annuler la réservation
      </button>
    </form>
  );
}
