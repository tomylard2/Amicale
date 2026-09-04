import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatEuros } from "@/lib/utils";
import {
  ALLOWED_BENEFICIAIRES,
  BENEFICIAIRE_ORDER,
  BENEFICIAIRE_LABELS,
  type MemberCategory,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Catalogue du matériel",
};

export default async function CataloguePage() {
  const session = await auth();
  const [materiels, currentUser] = await Promise.all([
    prisma.equipment.findMany({
      where: { isActive: true },
      orderBy: { nom: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { categorie: true },
    }),
  ]);
  const allowedBeneficiaires =
    ALLOWED_BENEFICIAIRES[(currentUser?.categorie as MemberCategory) ?? "CHATEAUBOURG"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Catalogue du matériel</h1>
          <p className="text-muted-foreground mt-1">
            Découvrez le matériel disponible à la réservation.
          </p>
        </div>
        <Button asChild>
          <Link href="/espace/reserver">Réserver du matériel</Link>
        </Button>
      </div>

      {materiels.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Aucun matériel n&apos;est disponible pour le moment.
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {materiels.map((m) => (
            <Card key={m.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video bg-muted grid place-items-center overflow-hidden">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt={m.nom}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl" aria-hidden>
                    📦
                  </span>
                )}
              </div>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{m.nom}</h2>
                  <span className="shrink-0 text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {m.quantiteTotale} dispo.
                  </span>
                </div>
                {m.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3 flex-1">
                    {m.description}
                  </p>
                )}
                {m.tarifBeneficiaire ? (
                  <div className="text-xs font-medium mt-3 space-y-0.5">
                    {BENEFICIAIRE_ORDER.filter(
                      (b) => allowedBeneficiaires.includes(b),
                    ).map((b) => {
                      const prix = {
                        CHATEAUBOURG: m.prixAmicaleChateaubourg,
                        AUTRE_AMICALE: m.prixAutreAmicale,
                        AUTRE_ASSOCIATION: m.prixAutreAssociation,
                      }[b];
                      if (prix == null) return null;
                      return (
                        <p key={b}>
                          {BENEFICIAIRE_LABELS[b]} : {formatEuros(prix)}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  m.prix > 0 && (
                    <p className="text-xs font-medium mt-3">
                      Prix :{" "}
                      {m.prixExponentiel
                        ? `${formatEuros(m.prix)} / unité`
                        : `${formatEuros(m.prix)} (forfait)`}
                    </p>
                  )
                )}
                {m.caution != null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Caution : {formatEuros(m.caution)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
