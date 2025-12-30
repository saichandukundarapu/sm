import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cartData, billingInfo } = req.body;

    if (!cartData || !cartData.items?.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!billingInfo?.email) {
      return res.status(400).json({ error: "Billing info missing" });
    }

    // ⚠️ cartData.orderId MUST exist
    if (!cartData.orderId) {
      return res.status(400).json({ error: "Order ID missing" });
    }

    // 1️⃣ Find or create customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: billingInfo.email,
      limit: 1,
    });

    customer = existingCustomers.data[0] ??
      await stripe.customers.create({
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

    // 2️⃣ Line items
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

    // 3️⃣ Create Checkout Session (FIXED)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer: customer.id,

      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["AU"],
      },

      line_items,

      metadata: {
        orderId: cartData.orderId, // 🔴 REQUIRED
      },

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
