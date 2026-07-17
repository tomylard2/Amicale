import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/reservation/date-range-picker";
import {
  ReservationBuilder,
  type BuilderItem,
} from "@/components/reservation/reservation-builder";
import { computeAvailability } from "@/lib/availability";
import { isValidDateInput, parseDateInput } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Réserver du matériel",
};

export default async function ReserverPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const { debut, fin } = await searchParams;

  const datesValides =
    isValidDateInput(debut) &&
    isValidDateInput(fin) &&
    (fin as string) >= (debut as string);

  let items: BuilderItem[] = [];
  if (datesValides) {
    const availability = await computeAvailability(
      parseDateInput(debut as string),
      parseDateInput(fin as string),
    );
    items = availability.map((a) => ({
      id: a.equipment.id,
      nom: a.equipment.nom,
      description: a.equipment.description,
      photoUrl: a.equipment.photoUrl,
      available: a.available,
      caution: a.equipment.caution,
      quantiteTotale: a.equipment.quantiteTotale,
    }));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Réserver du matériel</h1>
        <p className="text-muted-foreground mt-1">
          Choisissez vos dates : seules les quantités réellement disponibles
          vous seront proposées.
        </p>
      </div>

      <Card className="p-5">
        <DateRangePicker defaultDebut={debut} defaultFin={fin} />
      </Card>

      {!datesValides ? (
        <Card className="p-8 text-center text-muted-foreground">
          Sélectionnez une date de début et une date de fin pour voir les
          disponibilités.
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Disponibilités du{" "}
            <strong className="text-foreground">
              {formatDateLongueFr(debut as string)}
            </strong>{" "}
            au{" "}
            <strong className="text-foreground">
              {formatDateLongueFr(fin as string)}
            </strong>
          </p>
          <ReservationBuilder
            dateDebut={debut as string}
            dateFin={fin as string}
            items={items}
          />
        </div>
      )}
    </div>
  );
}

// Petit formateur local pour éviter un import circulaire de fuseau.
function formatDateLongueFr(input: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${input}T00:00:00`));
}
