import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail({ order }) {
  try {
    const emails = [];

    // ================= CUSTOMER EMAIL =================
   
      emails.push({
        from: process.env.EMAIL_FROM_ADDRESS,
        to: 'info@brisbanesurgicalsupplies.com',
        subject: `Order Confirmation - ${order.orderId}`,
        html: `
          <h2>Thank you for your order</h2>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p>We will process your order shortly.</p>
          <br/>
          <p>Brisbane Surgical Supplies</p>
        `,
      });
    

    // ================= COMPANY EMAIL =================
    emails.push({
      from: process.env.EMAIL_FROM_ADDRESS,
      to: process.env.COMPANY_EMAIL,
      subject: `New Order Received - ${order.orderId}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Customer Email:</strong> ${order.email || "N/A"}</p>
        <p>Status: ${order.status}</p>
      `,
    });

    await resend.emails.send(emails);
    console.log("✅ Customer & Company emails sent");

    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}
