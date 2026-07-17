"use client";

import { confirmReservation } from "@/lib/actions/admin-reservations";

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
