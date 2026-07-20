import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { readFileSync } from "node:fs";
import path from "node:path";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logo: { width: 60, height: 60 },
  emitterBlock: { fontSize: 9, color: "#475569", maxWidth: 220 },
  emitterName: { fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  title: { fontSize: 18, fontWeight: 700, textAlign: "right" },
  meta: { fontSize: 9, color: "#475569", textAlign: "right", marginTop: 4 },
  memberBlock: { marginBottom: 24, padding: 10, backgroundColor: "#f8fafc", borderRadius: 4, maxWidth: 260 },
  memberLabel: { fontSize: 8, color: "#64748b", marginBottom: 2, textTransform: "uppercase" },
  memberName: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  datesBlock: { marginBottom: 16, padding: 10, backgroundColor: "#fef2f2", borderRadius: 4 },
  datesLabel: { fontSize: 8, color: "#64748b", marginBottom: 2, textTransform: "uppercase" },
  datesValue: { fontSize: 12, fontWeight: 700, color: "#dc2626" },
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
  pickupNote: {
    marginTop: 24,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    fontSize: 9.5,
    color: "#78350f",
    lineHeight: 1.4,
  },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#94a3b8", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8 },
});

function formatEuros(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
}

export type VoucherPdfData = {
  reservationId: string;
  dateDebut: Date;
  dateFin: Date;
  memberNom: string;
  memberEmail: string;
  items: { nom: string; quantite: number; montant: number }[];
  caution: number;
};

export function VoucherDocument({ voucher }: { voucher: VoucherPdfData }) {
  const total = voucher.items.reduce((sum, it) => sum + it.montant, 0);
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
            <Text style={styles.title}>BON DE RÉSERVATION</Text>
            <Text style={styles.meta}>Réf. {voucher.reservationId.slice(-8).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.memberBlock}>
          <Text style={styles.memberLabel}>Réservé par</Text>
          <Text style={styles.memberName}>{voucher.memberNom}</Text>
          <Text>{voucher.memberEmail}</Text>
        </View>

        <View style={styles.datesBlock}>
          <Text style={styles.datesLabel}>Période de réservation</Text>
          <Text style={styles.datesValue}>
            Du {formatDate(voucher.dateDebut)} au {formatDate(voucher.dateFin)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Matériel</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colAmount}>Prix</Text>
          </View>
          {voucher.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.nom}</Text>
              <Text style={styles.colQty}>{item.quantite}</Text>
              <Text style={styles.colAmount}>
                {item.montant > 0 ? formatEuros(item.montant) : "—"}
              </Text>
            </View>
          ))}
        </View>

        {total > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatEuros(total)}</Text>
          </View>
        )}

        {voucher.caution > 0 && (
          <Text style={styles.cautionNote}>
            Caution demandée : {formatEuros(voucher.caution)}
          </Text>
        )}

        <Text style={styles.pickupNote}>
          Pour récupérer votre réservation, merci de prendre contact avec
          Luc, Corentin ou Tom au minimum 72h avant la date prévue.
        </Text>

        <View style={styles.footer} fixed>
          <Text>
            Amicale des Sapeurs-Pompiers de Châteaubourg — Association loi 1901
          </Text>
        </View>
      </Page>
    </Document>
  );
}
