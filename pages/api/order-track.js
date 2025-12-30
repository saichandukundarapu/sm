import orderModel from "../../../models/order";
import dbConnect from "../../../utils/dbConnect";

export default async function apiHandler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { id, session_id } = req.query;

        let order = null;

        // ✅ STRIPE ORDER TRACK (optional)
        if (session_id) {
          order = await orderModel
            .findOne({ stripeSessionId: session_id })
            .select("-_id")
            .lean();
        }

        // ✅ NORMAL ORDER TRACK (orderId)
        if (!order && id) {
          order = await orderModel
            .findOne({ orderId: id })
            .select("-_id")
            .lean();
        }

        if (!order) {
          return res.status(404).json({ success: false });
        }

        res.setHeader(
          "Cache-Control",
          "s-maxage=60, stale-while-revalidate"
        );

        res.status(200).json({ success: true, order });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
