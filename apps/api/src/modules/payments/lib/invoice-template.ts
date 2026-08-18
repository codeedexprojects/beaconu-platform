import PDFDocument from "pdfkit";
import type { InvoiceData } from "../queries/invoice-data.query";

// Single shared layout, reused for every payment category (application fee,
// token fee, commute fee, hostel booking fee, course/semester fees, ...).
// Category-specific differences are entirely data-driven (feeCategoryLabel,
// amounts) — nothing here branches on feeCategory.
export function buildInvoicePdf(
  data: InvoiceData,
  receiptNumber: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { college, student } = data;

    // Header — college identity
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(college.name, { align: "left" });
    doc.fontSize(9).font("Helvetica").fillColor("#555");
    const addressLine = [
      college.address,
      college.city,
      college.state,
      college.pinCode,
    ]
      .filter(Boolean)
      .join(", ");
    if (addressLine) doc.text(addressLine);
    doc.fillColor("#000");
    doc.moveDown(1);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("PAYMENT RECEIPT", { align: "center" });
    doc.moveDown(1);

    // Receipt meta
    const metaTop = doc.y;
    doc.fontSize(10).font("Helvetica");
    doc.text(`Receipt No: ${receiptNumber}`, 50, metaTop);
    doc.text(
      `Date: ${new Date(data.paidAt).toLocaleDateString("en-IN")}`,
      350,
      metaTop,
    );
    doc.moveDown(1.5);

    // Student details
    doc.font("Helvetica-Bold").text("Billed To");
    doc.font("Helvetica");
    doc.text(student.fullName);
    if (student.email) doc.text(student.email);
    if (student.phoneNumber) doc.text(student.phoneNumber);
    doc.moveDown(1.5);

    // Line item table
    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Description", 50, tableTop);
    doc.text("Amount", 450, tableTop, { width: 90, align: "right" });
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    let rowY = tableTop + 25;
    doc.font("Helvetica");
    doc.text(
      data.description
        ? `${data.feeCategoryLabel} — ${data.description}`
        : data.feeCategoryLabel,
      50,
      rowY,
      { width: 380 },
    );
    doc.text(`${data.currency} ${data.grossAmount}`, 450, rowY, {
      width: 90,
      align: "right",
    });
    rowY += 20;

    const discount = Number(data.scholarshipDiscount);
    if (discount > 0) {
      doc.text("Scholarship Discount", 50, rowY, { width: 380 });
      doc.text(`- ${data.currency} ${data.scholarshipDiscount}`, 450, rowY, {
        width: 90,
        align: "right",
      });
      rowY += 20;
    }

    doc
      .moveTo(50, rowY + 5)
      .lineTo(545, rowY + 5)
      .stroke();
    rowY += 15;

    doc.font("Helvetica-Bold");
    doc.text("Total Paid", 50, rowY, { width: 380 });
    doc.text(`${data.currency} ${data.netAmount}`, 450, rowY, {
      width: 90,
      align: "right",
    });
    doc.font("Helvetica");
    doc.moveDown(3);

    // Payment reference
    doc.fontSize(9).fillColor("#555");
    doc.text(`Transaction No: ${data.transactionNumber}`);
    doc.text(`Payment Method: ${data.paymentMethod}`);
    if (data.razorpayPaymentId) {
      doc.text(`Gateway Reference: ${data.razorpayPaymentId}`);
    }
    doc.fillColor("#000");

    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        "This is a system-generated receipt and does not require a signature.",
        { align: "center" },
      );

    doc.end();
  });
}
