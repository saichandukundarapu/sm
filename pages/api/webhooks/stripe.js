import Stripe from "stripe";
import { buffer } from "micro";
import dbConnect from "../../../utils/dbConnect";
import orderModel from "../../../models/order";
import { generateReceiptPdf } from "../../../utils/generateReceiptPdf";

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

  // ✅ HANDLE ONLY REQUIRED EVENT
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // 🔥 SAFETY: Ignore unpaid sessions
    if (session.payment_status !== "paid") {
      return res.json({ received: true });
    }

    // 🔥 FIND ORDER (session.id MUST be saved at checkout creation)
    const order = await orderModel.findOne({
      stripeSessionId: session.id,
    });

    if (!order) {
      console.warn("⚠ Order not found for session:", session.id);
      return res.json({ received: true });
    }

    // 🔥 IDEMPOTENCY: Prevent duplicate processing
    if (order.paymentStatus === "Paid") {
      return res.json({ received: true });
    }

    order.paymentStatus = "Paid";
    order.paymentMethod = "Stripe";
    order.paidAt = new Date();

    // 🔥 Generate receipt only once
    if (!order.receiptUrl) {
      const receiptUrl = await generateReceiptPdf(order);
      order.receiptUrl = receiptUrl;
    }

    await order.save();
  }

  res.json({ received: true });
}
