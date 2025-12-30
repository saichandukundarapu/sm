import Stripe from "stripe";
import orderModel from "../../../models/order";
import dbConnect from "../../../utils/dbConnect";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function generateOrderId() {
  return (
    "R" +
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    Date.now().toString().slice(-6)
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { cartData, billingInfo } = req.body;

    // 🛑 Validation
    if (!cartData || !cartData.items?.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!billingInfo?.email) {
      return res.status(400).json({ error: "Billing info missing" });
    }

    // 🔁 1️⃣ Find or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: billingInfo.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: billingInfo.email,
        name: billingInfo.fullName,
        phone: billingInfo.phone,
        address: {
          line1: billingInfo.house,
          city: billingInfo.city,
          state: billingInfo.state,
          postal_code: billingInfo.zipCode,
          country: "AU",
        },
      });
    }

    // 🧾 2️⃣ Create ORDER BEFORE Stripe
    const order = await orderModel.create({
      orderId: generateOrderId(),
      products: cartData.items,
      billingInfo,
      shippingInfo: billingInfo,
      deliveryInfo: cartData.deliveryInfo || {
        type: "Default",
        cost: 0,
        area: null,
      },
      paymentMethod: "Stripe",
      paymentStatus: "Unpaid",
      status: "Draft",
      totalPrice: cartData.items.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
      ),
      payAmount: cartData.items.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
      ),
      coupon: cartData.coupon || { code: "", discount: 0 },
      vat: 0,
      tax: 0,
    });

    // 🧾 3️⃣ Line items
    const line_items = cartData.items.map((item) => ({
      price_data: {
        currency: "aud",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    // 💳 4️⃣ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer: customer.id,

      customer_update: {
        name: "auto",
        address: "auto",
        shipping: "auto",
      },

      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["AU"],
      },

      line_items,

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,

      metadata: {
        orderId: order.orderId,
        orderDbId: order._id.toString(),
        customer_email: billingInfo.email,
      },
    });

    // 🔥 5️⃣ SAVE Stripe session ID (CRITICAL FIX)
    order.stripeSessionId = session.id;
    await order.save();

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
