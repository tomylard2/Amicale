import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/lib/constants";

const statusStyles: Record<ReservationStatus, string> = {
  EN_ATTENTE: "bg-amber-100 text-amber-800",
  CONFIRMEE: "bg-green-100 text-green-800",
  ANNULEE: "bg-slate-200 text-slate-600",
  TERMINEE: "bg-slate-100 text-slate-500",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: ReservationStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
