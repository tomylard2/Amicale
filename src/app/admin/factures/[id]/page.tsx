import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SendInvoiceButton } from "@/components/admin/send-invoice-button";
import { formatEuros, formatDateLongue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Détail de la facture",
};

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) notFound();

  const total = invoice.items.reduce((sum, it) => sum + it.montant, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Facture {invoice.numero}</h1>
          <p className="text-muted-foreground mt-1">
            Émise le {formatDateLongue(invoice.dateEmission)}
            {invoice.sentAt &&
              ` · envoyée le ${formatDateLongue(invoice.sentAt)}`}
          </p>
        </div>
        <Link href="/admin/factures" className="text-sm text-primary hover:underline">
          ← Toutes les factures
        </Link>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium">{invoice.clientNom}</p>
            {invoice.clientAdresse && <p className="text-sm">{invoice.clientAdresse}</p>}
            <p className="text-sm">{invoice.clientEmail}</p>
          </div>

          <div className="border-t border-border pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-center">Qté</th>
                  <th className="pb-2 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it) => (
                  <tr key={it.id} className="border-t border-border">
                    <td className="py-2">{it.description}</td>
                    <td className="py-2 text-center">{it.quantite}</td>
                    <td className="py-2 text-right">{formatEuros(it.montant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-semibold mt-3 pt-3 border-t border-border">
              Total : {formatEuros(total)}
            </div>
            {invoice.caution ? (
              <p className="text-right text-sm text-muted-foreground mt-1">
                Caution demandée en complément : {formatEuros(invoice.caution)}
              </p>
            ) : null}
          </div>

          {invoice.notes && (
            <div className="border-t border-border pt-4 text-sm text-muted-foreground">
              {invoice.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        <Button asChild variant="outline">
          <a href={`/admin/factures/${invoice.id}/pdf`} target="_blank" rel="noopener noreferrer">
            Télécharger le PDF
          </a>
        </Button>
        <SendInvoiceButton id={invoice.id} alreadySent={!!invoice.sentAt} />
      </div>
    </div>
  );
}
