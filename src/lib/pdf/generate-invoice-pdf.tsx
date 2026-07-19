import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument, type InvoicePdfData } from "@/lib/pdf/invoice-document";

export async function generateInvoicePdf(invoice: InvoicePdfData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument invoice={invoice} />);
}
