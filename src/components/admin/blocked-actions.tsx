"use client";

import { deleteBlockedPeriod } from "@/lib/actions/blocked";

export function DeleteBlockedButton({ id }: { id: string }) {
  return (
    <form
      action={deleteBlockedPeriod}
      onSubmit={(e) => {
        if (!confirm("Supprimer cette période d'indisponibilité ?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-danger hover:underline">
        Supprimer
      </button>
    </form>
  );
}
