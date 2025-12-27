import { URL, URLSearchParams } from "url";
import orderModel from "~/models/order";
import sendEmail from "../../../lib/sendEmail";

export default async function apiHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { status, order_id } = req.query;

    switch (status) {
      // ================= PAYMENT SUCCESS =================
      case "success": {
        const order = await orderModel.findOne({ orderId: order_id });

        if (!order) {
          return res.status(404).json({ success: false });
        }

        if (order.status === "Draft") {
          order.paymentStatus = "Paid";
          order.status = "Pending";
          await order.save();

          // ✅ SEND EMAILS (customer + company)
          await sendEmail({ order });
        }

        res.writeHead(302, {
          Location: `/checkout/success/${order._id}`,
        });
        return res.end();
      }

      // ================= PAYMENT FAILED / CANCELLED =================
      case "fail":
      case "cancel":
        await orderModel.findOneAndRemove({ orderId: order_id });
        res.writeHead(302, { Location: "/" });
        return res.end();

      // ================= IPN CALLBACK =================
      case "ipn": {
        if (req.body?.status === "VALID") {
          const orderData = await orderModel.findOne({ orderId: order_id });

          if (orderData && orderData.status === "Draft") {
            orderData.paymentStatus = "Paid";
            orderData.status = "Pending";
            orderData.paymentId = req.body.tran_id;
            await orderData.save();
          }

          const url = new URL(
            process.env.NEXT_PUBLIC_SSLCOMMERZ_VALIDATION_API_URL
          );

          url.search = new URLSearchParams({
            val_id: req.body.val_id,
            store_id: process.env.NEXT_PUBLIC_SSLCOMMERZ_ID,
            store_passwd: process.env.NEXT_PUBLIC_SSLCOMMERZ_PASS,
          });

          await fetch(url).catch(console.error);
        }

        return res.status(201).json({ message: "ok" });
      }

      default:
        return res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error("ORDER EMAIL ERROR:", error);
    return res.status(500).json({ success: false });
  }
}
