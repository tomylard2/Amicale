import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
  }

  const pdf = await generateInvoicePdf({
    numero: invoice.numero,
    dateEmission: invoice.dateEmission,
    clientNom: invoice.clientNom,
    clientEmail: invoice.clientEmail,
    clientAdresse: invoice.clientAdresse,
    notes: invoice.notes,
    caution: invoice.caution,
    items: invoice.items,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.numero}.pdf"`,
    },
  });
}
