import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateCourte } from "@/lib/utils";
import { ROLES } from "@/lib/constants";
import {
  ApproveUserButton,
  ToggleUserActiveButton,
  DeleteUserButton,
  ChangeRoleButton,
} from "@/components/admin/user-actions";

export const metadata: Metadata = {
  title: "Gestion des utilisateurs",
};

export default async function UtilisateursPage() {
  const session = await auth();
  const currentUserId = session!.user.id;
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { _count: { select: { reservations: true } } },
  });

  const enAttente = users.filter(
    (u) => u.role === ROLES.USER && !u.isApproved,
  );
  const autres = users.filter((u) => !(u.role === ROLES.USER && !u.isApproved));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            {users.length} compte{users.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/utilisateurs/nouveau">+ Ajouter un membre</Link>
        </Button>
      </div>

      {/* Comptes à approuver */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Comptes à approuver ({enAttente.length})
        </h2>
        {enAttente.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground text-sm">
            Aucun compte en attente d&apos;approbation.
          </Card>
        ) : (
          <div className="space-y-2">
            {enAttente.map((u) => (
              <Card key={u.id} className="border-amber-200 bg-amber-50/50">
                <CardContent className="flex items-center justify-between gap-4 flex-wrap py-4">
                  <div>
                    <p className="font-medium">
                      {u.prenom} {u.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {u.email}
                      {u.telephone ? ` · ${u.telephone}` : ""} · inscrit le{" "}
                      {formatDateCourte(u.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ApproveUserButton id={u.id} />
                    <DeleteUserButton id={u.id} nom={`${u.prenom} ${u.nom}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Tous les comptes */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Tous les comptes
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3 font-medium">Nom</th>
                  <th className="p-3 font-medium">Contact</th>
                  <th className="p-3 font-medium">Rôle</th>
                  <th className="p-3 font-medium">Réservations</th>
                  <th className="p-3 font-medium">Statut</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {autres.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3 font-medium">
                      {u.prenom} {u.nom}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {u.email}
                      {u.telephone && (
                        <span className="block text-xs">{u.telephone}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.role === ROLES.ADMIN ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                          Admin
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Membre</span>
                      )}
                    </td>
                    <td className="p-3">{u._count.reservations}</td>
                    <td className="p-3">
                      {!u.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-600 px-2.5 py-0.5 text-xs font-medium">
                          Désactivé
                        </span>
                      ) : u.isApproved ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.id === currentUserId ? (
                        <span className="block text-right text-xs text-muted-foreground">
                          Vous
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-4 flex-wrap">
                          <ChangeRoleButton id={u.id} role={u.role} />
                          {u.role !== ROLES.ADMIN && (
                            <>
                              <ToggleUserActiveButton
                                id={u.id}
                                isActive={u.isActive}
                              />
                              <DeleteUserButton
                                id={u.id}
                                nom={`${u.prenom} ${u.nom}`}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
