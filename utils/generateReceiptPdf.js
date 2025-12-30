import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";

export async function generateReceiptPdf(order) {
  const receiptsDir = path.join(process.cwd(), "public", "receipts");
  await fs.ensureDir(receiptsDir);

  const fileName = `receipt_${order.orderId}.pdf`;
  const filePath = path.join(receiptsDir, fileName);

  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text("Payment Receipt", { align: "center" });
  doc.moveDown();

  // Order info
  doc.fontSize(12);
  doc.text(`Order ID: ${order.orderId}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Payment Status: ${order.paymentStatus}`);
  doc.text(`Date: ${new Date(order.paidAt).toLocaleString()}`);
  doc.moveDown();

  // Customer
  doc.text(`Customer: ${order.billingInfo.fullName}`);
  doc.text(`Email: ${order.billingInfo.email}`);
  doc.moveDown();

  // Products
  doc.text("Items:", { underline: true });
  order.products.forEach((p, i) => {
    doc.text(`${i + 1}. ${p.name} × ${p.qty} — $${p.price}`);
  });

  doc.moveDown();
  doc.text(`Total Amount: $${order.payAmount}`, { bold: true });

  doc.end();

  await new Promise((resolve) => stream.on("finish", resolve));

  return `/receipts/${fileName}`;
}
