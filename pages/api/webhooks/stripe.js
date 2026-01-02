import Stripe from "stripe";
import { buffer } from "micro";
import dbConnect from "../../../utils/dbConnect";
import orderModel from "../../../models/order";
import sendEmail from "../../../lib/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe Webhook Error:", err.message);
    return res.status(400).send("Webhook Error");
  }

  await dbConnect();

  if (event.type !== "checkout.session.completed") {
    return res.json({ received: true });
  }

  const session = event.data.object;

  // ✅ Only process paid sessions
  if (session.payment_status !== "paid") {
    return res.json({ received: true });
  }

  // 🔥 Find order
  const order = await orderModel.findOne({
    stripeSessionId: session.id,
  });

  if (!order) {
    console.warn("⚠ Order not found for session:", session.id);
    return res.json({ received: true });
  }

  // 🔐 Idempotency
  if (order.paymentStatus === "Paid") {
    return res.json({ received: true });
  }

  // ================= UPDATE ORDER =================
  order.paymentStatus = "Paid";
  order.paymentMethod = "Stripe";
  order.status = "Pending";
  order.paidAt = new Date();

  await order.save();

  // ================= BUILD EMAIL RECEIPT =================

  const productsHtml = order.products
    .map(
      (p) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${p.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.qty}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${p.price}</td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2>🧾 Order Receipt</h2>
      <p>Thank you for your purchase!</p>

      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
      <p><strong>Payment Method:</strong> Stripe</p>
      <p><strong>Payment Status:</strong> Paid</p>

      <h3>Customer Details</h3>
      <p>
        ${order.billingInfo.fullName}<br/>
        ${order.billingInfo.email}<br/>
        ${order.billingInfo.phone}<br/>
        ${order.billingInfo.house}, ${order.billingInfo.city}<br/>
        ${order.billingInfo.state} ${order.billingInfo.zipCode}<br/>
        ${order.billingInfo.country}
      </p>

      <h3>Items</h3>
      <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
            <th style="padding:8px;border:1px solid #ddd;">Qty</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>

      <h3>Payment Summary</h3>
      <p>Subtotal: $${order.totalPrice}</p>
      <p>Tax: $${order.tax || 0}</p>
      <p>VAT: $${order.vat || 0}</p>
      <p><strong>Total Paid: $${order.payAmount}</strong></p>

      <p style="margin-top:20px;">
        We will process your order shortly.
      </p>

      <p style="font-size:12px;color:#777;">
        Brisbane Surgical Supplies
      </p>
    </div>
  `;

  // ================= SEND EMAILS =================

  const customerEmail = order.billingInfo?.email;
  const adminEmail = process.env.ADMIN_EMAIL;

  try {
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Your Receipt - Order ${order.orderId}`,
        html: emailHtml,
      });
    }

    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Paid Order - ${order.orderId}`,
        html: emailHtml,
      });
    }
  } catch (emailErr) {
    console.error("❌ EMAIL SEND FAILED:", emailErr);
  }

  res.json({ received: true });
}
