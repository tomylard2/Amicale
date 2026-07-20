import Link from "next/link";
import { Card } from "@/components/ui/card";

export type DayEquipmentSummary = { nom: string; quantite: number }[];

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Génère les cases du calendrier (lundi en premier), null = hors du mois. */
function buildWeeks(year: number, monthIndex: number): (number | null)[][] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // 0 = lundi

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function ReservationsCalendar({
  year,
  monthIndex,
  byDay,
  baseQuery,
}: {
  year: number;
  monthIndex: number;
  byDay: Map<string, DayEquipmentSummary>;
  /** Filtres actifs (statut, membre) à préserver dans les liens de navigation. */
  baseQuery: Record<string, string | undefined>;
}) {
  const weeks = buildWeeks(year, monthIndex);
  const todayKey = new Date();
  const isToday = (d: number) =>
    d === todayKey.getDate() &&
    monthIndex === todayKey.getMonth() &&
    year === todayKey.getFullYear();

  const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;

  function monthHref(y: number, m: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(baseQuery)) if (v) params.set(k, v);
    params.set("vue", "calendrier");
    params.set("mois", `${y}-${pad(m + 1)}`);
    return `/admin/reservations?${params.toString()}`;
  }

  /** Bascule vers la vue liste, filtrée sur les réservations actives ce jour-là. */
  function dayHref(dateKey: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(baseQuery)) if (v) params.set(k, v);
    params.set("date", dateKey);
    return `/admin/reservations?${params.toString()}`;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={monthHref(prevYear, prevMonth)}
          className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-muted text-sm"
          aria-label="Mois précédent"
        >
          ←
        </Link>
        <p className="font-semibold">
          {MOIS_LABELS[monthIndex]} {year}
        </p>
        <Link
          href={monthHref(nextYear, nextMonth)}
          className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-muted text-sm"
          aria-label="Mois suivant"
        >
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {JOURS.map((j) => (
          <div key={j} className="text-center font-medium text-muted-foreground pb-1">
            {j}
          </div>
        ))}

        {weeks.flatMap((week, wi) =>
          week.map((day, di) => {
            if (day === null) {
              return <div key={`${wi}-${di}`} className="min-h-[72px]" />;
            }
            const key = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
            const summary = byDay.get(key) ?? [];
            const hasReservations = summary.length > 0;
            const dayContent = (
              <>
                <p className="text-[11px] font-medium mb-0.5">{day}</p>
                {hasReservations && (
                  <ul className="space-y-0.5">
                    {summary.slice(0, 3).map((s) => (
                      <li
                        key={s.nom}
                        className="text-[9.5px] leading-tight text-primary bg-primary/10 rounded px-1 truncate"
                        title={`${s.quantite} × ${s.nom}`}
                      >
                        {s.quantite} × {s.nom}
                      </li>
                    ))}
                    {summary.length > 3 && (
                      <li className="text-[9.5px] text-muted-foreground">
                        +{summary.length - 3} autre{summary.length - 3 > 1 ? "s" : ""}
                      </li>
                    )}
                  </ul>
                )}
              </>
            );
            const cellClass = `min-h-[72px] rounded-md border p-1 block ${
              isToday(day) ? "border-primary bg-primary/5" : "border-border"
            } ${hasReservations ? "hover:border-primary hover:bg-primary/5 cursor-pointer" : ""}`;

            if (!hasReservations) {
              return (
                <div key={`${wi}-${di}`} className={cellClass}>
                  {dayContent}
                </div>
              );
            }
            return (
              <Link key={`${wi}-${di}`} href={dayHref(key)} className={cellClass}>
                {dayContent}
              </Link>
            );
          }),
        )}
      </div>
    </Card>
  );
}
