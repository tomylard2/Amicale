import { cn } from "@/lib/utils";

/**
 * Logo textuel « AMICALE DES SAPEURS-POMPIERS DE CHÂTEAUBOURG »
 * dans le style blocs rouge/blanc. À terme, remplaçable par un vrai
 * fichier image (logo officiel de l'amicale) si vous en avez un.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-stretch text-2xl sm:text-3xl font-extrabold tracking-tight">
        <span className="bg-primary text-white px-2 py-0.5 rounded-l">
          SAPEURS
        </span>
        <span className="bg-white text-slate-900 px-2 py-0.5 rounded-r">
          POMPIERS
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] text-slate-200">
        AMICALE DE CHÂTEAUBOURG
      </span>
    </div>
  );
}
