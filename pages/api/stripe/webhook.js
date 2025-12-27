import Stripe from "stripe";
import { buffer } from "micro";
import nodemailer from "nodemailer";

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  /* ================= CHECKOUT COMPLETED ================= */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Expand line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price.product"],
    });

    /* ================= EMAIL SETUP ================= */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
      },
    });

    const itemsHtml = fullSession.line_items.data
      .map(
        (item) =>
          `<li>
            ${item.description} × ${item.quantity}
            <br/>Price: AUD ${(item.amount_total / 100).toFixed(2)}
          </li>`
      )
      .join("");

    const shippingAddress = session.shipping_details?.address
      ? `
        ${session.shipping_details.address.line1 || ""}<br/>
        ${session.shipping_details.address.city || ""},
        ${session.shipping_details.address.state || ""}<br/>
        ${session.shipping_details.address.postal_code || ""}<br/>
        ${session.shipping_details.address.country || ""}
      `
      : "No shipping address provided";

    await transporter.sendMail({
      from: `"Brisbane Surgical Supplies" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🛒 New Order Received",
      html: `
        <h3>New Order Received</h3>

        <p><b>Order ID:</b> ${session.id}</p>
        <p><b>Customer Email:</b> ${session.customer_details?.email}</p>
        <p><b>Total:</b> AUD ${(session.amount_total / 100).toFixed(2)}</p>

        <h4>Products</h4>
        <ul>${itemsHtml}</ul>

        <h4>Shipping Address</h4>
        <p>${shippingAddress}</p>
      `,
    });

    console.log("✅ Admin order email sent");
  }

  res.json({ received: true });
}
