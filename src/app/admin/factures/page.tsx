import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatEuros, formatDateCourte } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Factures",
};

export default async function FacturesPage() {
  const factures = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Factures</h1>
          <p className="text-muted-foreground mt-1">
            {factures.length} facture{factures.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/factures/nouvelle">+ Nouvelle facture</Link>
        </Button>
      </div>

      {factures.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Aucune facture pour le moment.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3 font-medium">N°</th>
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Montant</th>
                  <th className="p-3 font-medium">Statut</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((f) => {
                  const total = f.items.reduce((sum, it) => sum + it.montant, 0);
                  return (
                    <tr key={f.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{f.numero}</td>
                      <td className="p-3">{f.clientNom}</td>
                      <td className="p-3 text-muted-foreground">
                        {formatDateCourte(f.dateEmission)}
                      </td>
                      <td className="p-3">{formatEuros(total)}</td>
                      <td className="p-3">
                        {f.sentAt ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
                            Envoyée
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium">
                            Non envoyée
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/admin/factures/${f.id}`}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
