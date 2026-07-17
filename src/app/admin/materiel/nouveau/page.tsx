import type { Metadata } from "next";
import Link from "next/link";
import { EquipmentForm } from "@/components/admin/equipment-form";
import { createEquipment } from "@/lib/actions/equipment";

export const metadata: Metadata = {
  title: "Ajouter un matériel",
};

export default function NouveauMaterielPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/materiel"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour au matériel
        </Link>
        <h1 className="text-2xl font-bold mt-2">Ajouter un matériel</h1>
      </div>
      <EquipmentForm action={createEquipment} submitLabel="Ajouter le matériel" />
    </div>
  );
}
