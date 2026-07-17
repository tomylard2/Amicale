import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatEuros } from "@/lib/utils";
import {
  DeleteEquipmentButton,
  ToggleActiveButton,
  EditEquipmentLink,
} from "@/components/admin/equipment-actions";

export const metadata: Metadata = {
  title: "Gestion du matériel",
};

export default async function MaterielPage() {
  const materiels = await prisma.equipment.findMany({
    orderBy: [{ isActive: "desc" }, { nom: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Matériel</h1>
          <p className="text-muted-foreground mt-1">
            {materiels.length} matériel{materiels.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/materiel/nouveau">+ Ajouter</Link>
        </Button>
      </div>

      {materiels.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Aucun matériel pour le moment. Cliquez sur « Ajouter » pour créer le
          premier.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3 font-medium">Matériel</th>
                  <th className="p-3 font-medium">Quantité</th>
                  <th className="p-3 font-medium">Caution</th>
                  <th className="p-3 font-medium">Statut</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materiels.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 align-middle"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {m.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.photoUrl}
                            alt={m.nom}
                            className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted grid place-items-center text-lg shrink-0">
                            📦
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{m.nom}</p>
                          {m.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{m.quantiteTotale}</td>
                    <td className="p-3">
                      {m.caution != null ? formatEuros(m.caution) : "—"}
                    </td>
                    <td className="p-3">
                      {m.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-600 px-2.5 py-0.5 text-xs font-medium">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-4">
                        <EditEquipmentLink id={m.id} />
                        <ToggleActiveButton id={m.id} isActive={m.isActive} />
                        <DeleteEquipmentButton id={m.id} nom={m.nom} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
