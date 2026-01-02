import Stripe from "stripe";
import { buffer } from "micro";
import dbConnect from "../../../utils/dbConnect";
import orderModel from "../../../models/order";
import { generateReceiptPdf } from "../../../utils/generateReceiptPdf";
import sendEmail from "../../../lib/sendEmail";
import path from "path";

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

  // ✅ HANDLE ONLY COMPLETED CHECKOUT
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status !== "paid") {
      return res.json({ received: true });
    }

    // 🔍 Find order using saved Stripe session ID
    const order = await orderModel.findOne({
      stripeSessionId: session.id,
    });

    if (!order) {
      console.warn("⚠ Order not found for session:", session.id);
      return res.json({ received: true });
    }

    // 🛑 Prevent duplicate processing
    if (order.paymentStatus === "Paid") {
      return res.json({ received: true });
    }

    // ================= UPDATE ORDER =================
    order.paymentStatus = "Paid";
    order.paymentMethod = "Stripe";
    order.status = "Pending";
    order.paidAt = new Date();

    // ================= GENERATE RECEIPT =================
    if (!order.receiptUrl) {
      const receiptUrl = await generateReceiptPdf(order);
      order.receiptUrl = receiptUrl;
    }

    await order.save();

    // ================= SEND EMAILS =================
    const customerEmail = order.billingInfo?.email;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Convert receipt URL/path to filename
    const receiptFilePath = order.receiptUrl;
    const receiptFileName = `receipt_${order.orderId}.pdf`;

    const emailHtml = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase.</p>

      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Total Paid:</strong> $${order.payAmount}</p>

      <p>Your receipt is attached to this email.</p>

      <p>We will process your order shortly.</p>
    `;

    const attachments = [
      {
        filename: receiptFileName,
        path: receiptFilePath, // local path or absolute URL
        contentType: "application/pdf",
      },
    ];

    // ✅ CUSTOMER EMAIL WITH PDF
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmation - ${order.orderId}`,
        html: emailHtml,
        attachments,
      });
    }

    // ✅ ADMIN EMAIL WITH PDF
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Paid Order - ${order.orderId}`,
        html: emailHtml,
        attachments,
      });
    }
  }

  res.json({ received: true });
}
