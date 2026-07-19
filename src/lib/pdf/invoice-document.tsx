import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { readFileSync } from "node:fs";
import path from "node:path";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logo: { width: 60, height: 60 },
  emitterBlock: { fontSize: 9, color: "#475569", maxWidth: 220 },
  emitterName: { fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  invoiceTitle: { fontSize: 18, fontWeight: 700, textAlign: "right" },
  invoiceMeta: { fontSize: 9, color: "#475569", textAlign: "right", marginTop: 4 },
  clientBlock: { marginBottom: 24, padding: 10, backgroundColor: "#f8fafc", borderRadius: 4, maxWidth: 260 },
  clientLabel: { fontSize: 8, color: "#64748b", marginBottom: 2, textTransform: "uppercase" },
  clientName: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0f172a", color: "#ffffff", padding: 6 },
  tableRow: { flexDirection: "row", padding: 6, borderBottom: "1px solid #e2e8f0" },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colAmount: { flex: 1.5, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12, paddingRight: 6 },
  totalLabel: { fontSize: 11, fontWeight: 700, marginRight: 12 },
  totalValue: { fontSize: 11, fontWeight: 700 },
  cautionNote: { marginTop: 8, fontSize: 9, color: "#475569", textAlign: "right" },
  notes: { marginTop: 24, fontSize: 9, color: "#475569" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#94a3b8", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8 },
});

function formatEuros(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
}

export type InvoicePdfData = {
  numero: string;
  dateEmission: Date;
  clientNom: string;
  clientEmail: string;
  clientAdresse: string | null;
  notes: string | null;
  caution: number | null;
  items: { description: string; quantite: number; montant: number }[];
};

export function InvoiceDocument({ invoice }: { invoice: InvoicePdfData }) {
  const total = invoice.items.reduce((sum, it) => sum + it.montant, 0);
  const logoBuffer = readFileSync(
    path.join(process.cwd(), "public", "images", "logo.png"),
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Image src={{ data: logoBuffer, format: "png" }} style={styles.logo} />
            <View style={styles.emitterBlock}>
              <Text style={styles.emitterName}>
                Amicale des Sapeurs-Pompiers de Châteaubourg
              </Text>
              <Text>8 Rue du Plessis Saint-Mélaine</Text>
              <Text>35220 Châteaubourg</Text>
              <Text>reservationamicalechateaubourg@gmail.com</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceMeta}>N° {invoice.numero}</Text>
            <Text style={styles.invoiceMeta}>
              Émise le {formatDate(invoice.dateEmission)}
            </Text>
          </View>
        </View>

        <View style={styles.clientBlock}>
          <Text style={styles.clientLabel}>Facturé à</Text>
          <Text style={styles.clientName}>{invoice.clientNom}</Text>
          {invoice.clientAdresse ? <Text>{invoice.clientAdresse}</Text> : null}
          <Text>{invoice.clientEmail}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colAmount}>Montant</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantite}</Text>
              <Text style={styles.colAmount}>{formatEuros(item.montant)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatEuros(total)}</Text>
        </View>

        {invoice.caution ? (
          <Text style={styles.cautionNote}>
            Caution demandée en complément : {formatEuros(invoice.caution)}
          </Text>
        ) : null}

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>
            Amicale des Sapeurs-Pompiers de Châteaubourg — Association loi 1901 —
            TVA non applicable, art. 293 B du CGI
          </Text>
        </View>
      </Page>
    </Document>
  );
}
