import { renderToBuffer } from "@react-pdf/renderer";
import { VoucherDocument, type VoucherPdfData } from "@/lib/pdf/voucher-document";

export async function generateVoucherPdf(voucher: VoucherPdfData): Promise<Buffer> {
  return renderToBuffer(<VoucherDocument voucher={voucher} />);
}
