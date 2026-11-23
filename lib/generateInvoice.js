
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,
      });

      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const navy = "#173B5E";
      const blue = "#2476A8";
      const lightBlue = "#EAF3F8";
      const grey = "#64748B";
      const dark = "#243447";

      const pageWidth = 505;
      const left = 45;
      const right = 550;

      const billing = order.billingInfo || {};
      const shipping = order.shippingInfo || {};
      const products = order.products || [];

      const logoPath = path.join(
        process.cwd(),
        "public",
        "resized-image.png"
      );

      const money = (value) =>
        `AUD $${Number(value || 0).toFixed(2)}`;

      const drawHeader = () => {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, left, 35, {
            fit: [220, 65],
          });
        } else {
          doc
            .fontSize(19)
            .fillColor(navy)
            .font("Helvetica-Bold")
            .text("BRISBANE", left, 42);

          doc
            .fontSize(13)
            .fillColor(blue)
            .text("Surgical Supplies", left, 65);
        }

        // Company contact information
        doc
          .fontSize(8)
          .fillColor(grey)
          .font("Helvetica")
          .text(
            "Professional Medical & Surgical Equipment",
            300,
            35,
            {
              width: 250,
              align: "right",
            }
          )
          .text(
            "1311 Gympie Road, Aspley QLD 4034",
            300,
            50,
            {
              width: 250,
              align: "right",
            }
          )
          .text(
            "+61 478 380 593",
            300,
            65,
            {
              width: 250,
              align: "right",
            }
          )
          .text(
            "info@brisbanesurgicalsuppplies.com",
            300,
            80,
            {
              width: 250,
              align: "right",
            }
          );

        doc
          .moveTo(left, 110)
          .lineTo(right, 110)
          .lineWidth(2)
          .strokeColor(blue)
          .stroke();
      };

      drawHeader();

      // Invoice title and status
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text("PRO FORMA INVOICE", left, 130);

      doc
        .roundedRect(435, 132, 115, 27, 6)
        .fill(order.paymentStatus === "Paid" ? "#DCFCE7" : "#FEF3C7");

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(order.paymentStatus === "Paid" ? "#166534" : "#92400E")
        .text(
          order.paymentStatus === "Paid" ? "PAID" : "PAYMENT PENDING",
          435,
          141,
          { width: 115, align: "center" }
        );

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(dark)
        .text(`Invoice Number: BSS-${order.orderId}`, left, 170);

      doc.text(
        `Order Date: ${new Date(
          order.orderDate || Date.now()
        ).toLocaleDateString("en-AU")}`,
        left,
        186
      );

      doc.text(`Order Reference: ${order.orderId}`, 320, 170);
      doc.text(`Order Status: ${order.status || "Pending"}`, 320, 186);

      // Customer details panels
      const panelY = 220;
      const panelHeight = 125;
      const panelWidth = 245;

      doc
        .roundedRect(left, panelY, panelWidth, panelHeight, 7)
        .fill(lightBlue);

      doc
        .roundedRect(305, panelY, panelWidth, panelHeight, 7)
        .fill("#F5F7FA");

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text("BILL TO", 58, 235);

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(dark);

      const billingLines = [
        billing.fullName,
        billing.email,
        billing.phone,
        billing.house,
        [billing.city, billing.state].filter(Boolean).join(", "),
        [billing.zipCode, billing.country].filter(Boolean).join(" "),
      ].filter(Boolean);

      let billingY = 255;

      billingLines.forEach((line) => {
        doc.text(String(line), 58, billingY, {
          width: 215,
          lineBreak: false,
          ellipsis: true,
        });
        billingY += 14;
      });

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text("SHIP TO", 318, 235);

      const shippingLines = [
        shipping.fullName || billing.fullName,
        shipping.email || billing.email,
        shipping.phone || billing.phone,
        shipping.house,
        [shipping.city, shipping.state].filter(Boolean).join(", "),
        [shipping.zipCode, shipping.country].filter(Boolean).join(" "),
      ].filter(Boolean);

      doc.fontSize(9).font("Helvetica").fillColor(dark);

      let shippingY = 255;

      shippingLines.forEach((line) => {
        doc.text(String(line), 318, shippingY, {
          width: 215,
          lineBreak: false,
          ellipsis: true,
        });
        shippingY += 14;
      });

      // Product table
      let tableY = 370;

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text("ORDER DETAILS", left, tableY);

      tableY += 25;

      const drawTableHeader = () => {
        doc
          .roundedRect(left, tableY, pageWidth, 28, 4)
          .fill(navy);

        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#FFFFFF");

        doc.text("DESCRIPTION", 55, tableY + 9, { width: 245 });
        doc.text("QTY", 355, tableY + 9, { width: 35, align: "center" });
        doc.text("UNIT PRICE", 395, tableY + 9, { width: 70, align: "right" });
        doc.text("TOTAL", 470, tableY + 9, { width: 70, align: "right" });

        tableY += 28;
      };

      drawTableHeader();

      products.forEach((product, index) => {
        const name =
          product.name ||
          product.title ||
          product.productName ||
          "Product";

        const quantity = Number(product.qty || 0);
        const unitPrice = Number(product.price || 0);
        const lineTotal = quantity * unitPrice;

        const rowHeight = 31;

        if (tableY + rowHeight > 690) {
          doc.addPage();
          drawHeader();
          tableY = 135;
          drawTableHeader();
        }

        if (index % 2 === 0) {
          doc
            .rect(left, tableY, pageWidth, rowHeight)
            .fill("#F5F8FB");
        }

        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor(dark);

        doc.text(String(name), 55, tableY + 10, {
          width: 285,
          ellipsis: true,
        });

        doc.text(String(quantity), 355, tableY + 10, {
          width: 35,
          align: "center",
        });

        doc.text(money(unitPrice), 395, tableY + 10, {
          width: 70,
          align: "right",
        });

        doc.text(money(lineTotal), 470, tableY + 10, {
          width: 70,
          align: "right",
        });

        tableY += rowHeight;
      });

      // Totals
      if (tableY > 630) {
        doc.addPage();
        drawHeader();
        tableY = 135;
      }

      tableY += 20;

      const totalsX = 345;

      const drawTotal = (label, value, bold = false) => {
        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(bold ? 11 : 9)
          .fillColor(bold ? navy : dark)
          .text(label, totalsX, tableY, { width: 100 });

        doc.text(value, 445, tableY, {
          width: 105,
          align: "right",
        });

        tableY += bold ? 25 : 19;
      };

      drawTotal("Subtotal", money(order.totalPrice));
      drawTotal("Tax", money(order.tax));
      drawTotal("VAT", money(order.vat));
      drawTotal(
        "Delivery",
        money(order.deliveryInfo?.cost)
      );

      const discountAmount =
        Number(order.coupon?.discount || 0) > 0
          ? (Number(order.coupon.discount) / 100) *
            Number(order.totalPrice || 0)
          : 0;

      if (discountAmount > 0) {
        drawTotal("Discount", `- ${money(discountAmount)}`);
      }

      doc
        .moveTo(totalsX, tableY)
        .lineTo(right, tableY)
        .lineWidth(1)
        .strokeColor(blue)
        .stroke();

      tableY += 12;

      doc
        .roundedRect(totalsX - 10, tableY - 5, 215, 38, 5)
        .fill(lightBlue);

      drawTotal("GRAND TOTAL", money(order.payAmount), true);

      // Footer
      const footerY = Math.max(tableY + 45, 745);

      doc
        .moveTo(left, footerY)
        .lineTo(right, footerY)
        .strokeColor("#D7E1EA")
        .stroke();

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text(
          "Thank you for choosing Brisbane Surgical Supplies!",
          left,
          footerY + 15,
          {
            width: pageWidth,
            align: "center",
          }
        );

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(grey)
        .text(
          "This is a pro forma invoice for your order request. It is not proof of payment or a tax invoice.",
          left,
          footerY + 33,
          { width: pageWidth, align: "center" }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
