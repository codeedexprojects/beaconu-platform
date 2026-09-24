import PDFDocument from "pdfkit";

export interface PayoutStatementData {
  transactionId: string;
  counsellor: {
    fullName: string;
    email: string;
    phoneNumber: string | null;
    counsellorCode: string | null;
  };
  amount: number;
  approvedAt: Date;
  requestedAt: Date;
  payoutDetails: Record<string, string>;
  reviewRemarks: string | null;
}

function maskAccount(value: string): string {
  return value.length > 4 ? `XXXX${value.slice(-4)}` : value;
}

export function buildPayoutStatementPdf(
  data: PayoutStatementData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const fmtDate = (d: Date) => d.toLocaleDateString("en-IN");

    doc.fontSize(18).font("Helvetica-Bold").text("BeaconU");
    doc.moveDown(1);
    doc.fontSize(14).text("PAYOUT STATEMENT", { align: "center" });
    doc.moveDown(1);

    const metaTop = doc.y;
    doc.fontSize(10).font("Helvetica");
    doc.text(`Payout Ref: ${data.transactionId}`, 50, metaTop);
    doc.text(`Approved On: ${fmtDate(data.approvedAt)}`, 350, metaTop);
    doc.moveDown(1.5);

    doc.font("Helvetica-Bold").text("Paid To");
    doc.font("Helvetica");
    doc.text(data.counsellor.fullName);
    if (data.counsellor.counsellorCode)
      doc.text(`Counsellor ID: ${data.counsellor.counsellorCode}`);
    doc.text(data.counsellor.email);
    if (data.counsellor.phoneNumber) doc.text(data.counsellor.phoneNumber);
    doc.moveDown(1.5);

    doc.font("Helvetica-Bold").text("Payout Method");
    doc.font("Helvetica");
    const details = data.payoutDetails;
    if (details.method === "upi") {
      doc.text(`UPI: ${details.upi_id ?? "-"}`);
    } else {
      doc.text(`Bank: ${details.bank_name ?? "-"}`);
      doc.text(`Account Holder: ${details.account_holder_name ?? "-"}`);
      doc.text(`Account No: ${maskAccount(details.account_number ?? "-")}`);
      doc.text(`IFSC: ${details.ifsc ?? "-"}`);
    }
    doc.moveDown(1.5);

    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Description", 50, tableTop);
    doc.text("Amount", 450, tableTop, { width: 90, align: "right" });
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();
    doc.font("Helvetica");
    doc.text(
      `Withdrawal requested on ${fmtDate(data.requestedAt)}`,
      50,
      tableTop + 25,
    );
    doc.text(`Rs. ${data.amount.toFixed(2)}`, 450, tableTop + 25, {
      width: 90,
      align: "right",
    });
    doc
      .moveTo(50, tableTop + 45)
      .lineTo(545, tableTop + 45)
      .stroke();
    doc.font("Helvetica-Bold");
    doc.text("Total Paid", 50, tableTop + 55);
    doc.text(`Rs. ${data.amount.toFixed(2)}`, 450, tableTop + 55, {
      width: 90,
      align: "right",
    });

    if (data.reviewRemarks) {
      doc.font("Helvetica").moveDown(3);
      doc.text(`Remarks: ${data.reviewRemarks}`, 50);
    }

    doc.fontSize(8).fillColor("#555");
    doc.text(
      "This is a system-generated statement and does not require a signature.",
      50,
      760,
      { align: "center", width: 495 },
    );

    doc.end();
  });
}
