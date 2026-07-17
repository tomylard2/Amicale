// Utilitaires de dates pour la réservation. On travaille à la granularité
// du jour (début et fin inclus). On normalise à minuit (heure locale).

/** Convertit une chaîne "YYYY-MM-DD" en Date (minuit, heure locale). */
export function parseDateInput(str: string): Date {
  return new Date(`${str}T00:00:00`);
}

/** Convertit une Date en chaîne "YYYY-MM-DD" (heure locale). */
export function toDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Date du jour au format "YYYY-MM-DD". */
export function todayInput(): string {
  return toDateInput(new Date());
}

/** Vérifie qu'une chaîne est une date valide au format "YYYY-MM-DD". */
export function isValidDateInput(str: string | undefined | null): str is string {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(`${str}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

/** Renvoie le samedi et le dimanche du prochain week-end (ou du week-end en cours). */
export function getUpcomingWeekend(): { samedi: Date; dimanche: Date } {
  const now = new Date();
  const day = now.getDay(); // 0 = dimanche ... 6 = samedi
  const daysUntilSat = (6 - day + 7) % 7;
  const samedi = new Date(now);
  samedi.setDate(now.getDate() + daysUntilSat);
  samedi.setHours(0, 0, 0, 0);
  const dimanche = new Date(samedi);
  dimanche.setDate(samedi.getDate() + 1);
  return { samedi, dimanche };
}
