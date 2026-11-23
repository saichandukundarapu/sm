
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderEmails = async ({
  order,
  customerEmail,
  invoiceBuffer,
}) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  const attachment = invoiceBuffer
    ? [
        {
          filename: `Order-${order.orderId}.pdf`,
          content: invoiceBuffer,
          contentType: "application/pdf",
        },
      ]
    : [];

  const orderDetails = `
    <h2>Order Confirmation</h2>
    <p>Order ID: ${order.orderId}</p>
    <p>Total: ${order.payAmount}</p>
    <p>Payment Status: ${order.paymentStatus}</p>
  `;

  const adminMail = transporter.sendMail({
    from: `"Brisbane Surgical Supplies" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `New Order Received - ${order.orderId}`,
    html: `<h2>New Customer Order</h2>${orderDetails}`,
    attachments: attachment,
  });

  const customerMail = customerEmail
    ? transporter.sendMail({
        from: `"Brisbane Surgical Supplies" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Your Order Confirmation - ${order.orderId}`,
        html: `<p>Thank you for your order!</p>${orderDetails}`,
        attachments: attachment,
      })
    : Promise.resolve();

  return Promise.all([adminMail, customerMail]);
};
