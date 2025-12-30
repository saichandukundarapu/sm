import Stripe from "stripe";
import dbConnect from "../../../utils/dbConnect";
import orderModel from "../../../models/order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

import { buffer } from "micro";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
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
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await dbConnect();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // 🔑 VERY IMPORTANT
        const order = await orderModel.findOne({
          stripeSessionId: session.id,
        });

        if (!order) {
          console.warn("⚠️ Order not found for session:", session.id);
          break;
        }

        order.paymentStatus = "Paid";
        order.paymentMethod = "Stripe";
        order.stripePaymentIntent = session.payment_intent;
        order.paidAt = new Date();

        await order.save();

        console.log("✅ Order marked as PAID:", order.orderId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).send("Webhook handler failed");
  }
}
