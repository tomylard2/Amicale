import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EquipmentForm } from "@/components/admin/equipment-form";
import { updateEquipment } from "@/lib/actions/equipment";

export const metadata: Metadata = {
  title: "Modifier un matériel",
};

export default async function ModifierMaterielPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipment = await prisma.equipment.findUnique({ where: { id } });
  if (!equipment) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/materiel"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour au matériel
        </Link>
        <h1 className="text-2xl font-bold mt-2">Modifier « {equipment.nom} »</h1>
      </div>
      <EquipmentForm
        action={updateEquipment}
        submitLabel="Enregistrer les modifications"
        initial={{
          id: equipment.id,
          nom: equipment.nom,
          description: equipment.description,
          quantiteTotale: equipment.quantiteTotale,
          caution: equipment.caution,
          photoUrl: equipment.photoUrl,
        }}
      />
    </div>
  );
}
