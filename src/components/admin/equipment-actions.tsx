"use client";

import { useActionState } from "react";
import Link from "next/link";
import { deleteEquipment, toggleEquipmentActive } from "@/lib/actions/equipment";

export function DeleteEquipmentButton({
  id,
  nom,
}: {
  id: string;
  nom: string;
}) {
  const [state, formAction] = useActionState(deleteEquipment, {});

  return (
    <>
      <form
        action={formAction}
        onSubmit={(e) => {
          if (
            !confirm(
              `Supprimer définitivement « ${nom} » ? Cette action est irréversible.`,
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="text-sm text-danger hover:underline"
        >
          Supprimer
        </button>
      </form>
      {state.error && (
        <p className="mt-1 text-xs text-danger max-w-xs">{state.error}</p>
      )}
    </>
  );
}

export function ToggleActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  return (
    <form action={toggleEquipmentActive}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        {isActive ? "Désactiver" : "Réactiver"}
      </button>
    </form>
  );
}

export function EditEquipmentLink({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/materiel/${id}/modifier`}
      className="text-sm text-primary hover:underline"
    >
      Modifier
    </Link>
  );
}
