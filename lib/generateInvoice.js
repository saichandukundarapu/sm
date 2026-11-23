
import PDFDocument from "pdfkit";

export const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const billing = order.billingInfo || {};

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Brisbane Surgical Supplies");

      doc.moveDown();

      doc
        .fontSize(16)
        .text("PRO FORMA INVOICE / ORDER REQUEST");

      doc.moveDown();

      doc.fontSize(11).font("Helvetica");

      doc.text(`Order ID: ${order.orderId}`);
      doc.text(
        `Order Date: ${new Date(order.orderDate || Date.now()).toLocaleDateString()}`
      );
      doc.text(`Order Status: ${order.status || "Pending"}`);
      doc.text(`Payment Status: ${order.paymentStatus || "Unpaid"}`);

      doc.moveDown();

      doc.font("Helvetica-Bold").text("Customer Details");
      doc.font("Helvetica");

      doc.text(`Name: ${billing.fullName || ""}`);
      doc.text(`Email: ${billing.email || ""}`);
      doc.text(`Phone: ${billing.phone || ""}`);
      doc.text(`Address: ${billing.house || ""}`);
      doc.text(`City: ${billing.city || ""}`);
      doc.text(`State: ${billing.state || ""}`);
      doc.text(`Postcode: ${billing.zipCode || ""}`);
      doc.text(`Country: ${billing.country || ""}`);

      doc.moveDown();

      doc.font("Helvetica-Bold").text("Order Summary");
      doc.moveDown(0.5);

      const products = order.products || [];

      products.forEach((product, index) => {
        doc
          .font("Helvetica")
          .text(
            `${index + 1}. ${product.name || product.title || "Product"} | Qty: ${product.qty || 0}`
          );
      });

      doc.moveDown();

      doc.font("Helvetica-Bold");
      doc.text(`Subtotal: ${Number(order.totalPrice || 0).toFixed(2)}`);
      doc.text(`VAT: ${Number(order.vat || 0).toFixed(2)}`);
      doc.text(`Tax: ${Number(order.tax || 0).toFixed(2)}`);
      doc.text(`Total: ${Number(order.payAmount || 0).toFixed(2)}`);

      doc.moveDown();
      doc.font("Helvetica").fontSize(10);
      doc.text(
        "This is a pro forma invoice for your order request. Payment has not been received."
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
