"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { todayInput } from "@/lib/dates";

export function DateRangePicker({
  defaultDebut,
  defaultFin,
  basePath = "/espace/reserver",
}: {
  defaultDebut?: string;
  defaultFin?: string;
  basePath?: string;
}) {
  const router = useRouter();
  const today = todayInput();
  const [debut, setDebut] = useState(defaultDebut ?? "");
  const [fin, setFin] = useState(defaultFin ?? "");

  function voirDisponibilites() {
    if (!debut || !fin) return;
    router.push(
      `${basePath}?debut=${encodeURIComponent(debut)}&fin=${encodeURIComponent(fin)}`,
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      <div className="flex-1">
        <Label htmlFor="debut">Date de début</Label>
        <Input
          id="debut"
          type="date"
          min={today}
          value={debut}
          onChange={(e) => {
            setDebut(e.target.value);
            if (fin && e.target.value > fin) setFin(e.target.value);
          }}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="fin">Date de fin</Label>
        <Input
          id="fin"
          type="date"
          min={debut || today}
          value={fin}
          onChange={(e) => setFin(e.target.value)}
        />
      </div>
      <Button
        type="button"
        onClick={voirDisponibilites}
        disabled={!debut || !fin}
        className="sm:mb-0"
      >
        Voir les disponibilités
      </Button>
    </div>
  );
}
