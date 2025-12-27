import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { billingInfo } = req.body;

  // 1️⃣ Check if customer already exists
  const existing = await stripe.customers.list({
    email: billingInfo.email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return res.json({ customerId: existing.data[0].id });
  }

  // 2️⃣ Create new customer
  const customer = await stripe.customers.create({
    email: billingInfo.email,
    name: billingInfo.fullName,
    phone: billingInfo.phone,
    address: {
      line1: billingInfo.house,
      city: billingInfo.city,
      state: billingInfo.state,
      postal_code: billingInfo.zipCode,
      country: billingInfo.country,
    },
  });

  res.json({ customerId: customer.id });
}
