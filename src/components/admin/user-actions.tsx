"use client";

import { useActionState } from "react";
import {
  approveUser,
  toggleUserActive,
  deleteUser,
  setUserRole,
} from "@/lib/actions/admin-users";
import { ROLES } from "@/lib/constants";

export function ChangeRoleButton({
  id,
  role,
}: {
  id: string;
  role: string;
}) {
  const nextRole = role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;
  const label =
    role === ROLES.ADMIN ? "Rétrograder en membre" : "Passer administrateur";
  return (
    <form
      action={setUserRole}
      onSubmit={(e) => {
        if (!confirm(`${label} ?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="role" value={nextRole} />
      <button
        type="submit"
        className="text-sm text-primary hover:underline whitespace-nowrap"
      >
        {label}
      </button>
    </form>
  );
}

export function ApproveUserButton({ id }: { id: string }) {
  return (
    <form action={approveUser}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium bg-success text-white hover:bg-green-700 transition-colors"
      >
        Approuver
      </button>
    </form>
  );
}

export function ToggleUserActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  return (
    <form action={toggleUserActive}>
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

export function DeleteUserButton({ id, nom }: { id: string; nom: string }) {
  const [state, formAction] = useActionState(deleteUser, {});
  return (
    <>
      <form
        action={formAction}
        onSubmit={(e) => {
          if (
            !confirm(
              `Supprimer définitivement le compte de ${nom} ainsi que ses réservations ?`,
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
      {state.error && (
        <p className="mt-1 text-xs text-danger max-w-[12rem]">{state.error}</p>
      )}
    </>
  );
}
