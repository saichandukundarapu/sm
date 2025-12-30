import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Spinner from "~/components/Ui/Spinner";
import { postData } from "~/lib/clientFunctions";

export default function Stripe() {
  const cartData = useSelector((state) => state.cart);
  const hasRedirected = useRef(false); // ✅ prevent duplicate calls

  useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    async function redirectToCheckout() {
      try {
        if (!cartData.items?.length) {
          toast.error("Cart is empty");
          return;
        }

        if (!cartData.billingInfo?.email) {
          toast.error("Billing information missing");
          return;
        }

        const response = await postData(
          "/api/checkout/create-checkout-session",
          {
            cartData,
            billingInfo: cartData.billingInfo, // ✅ required
          }
        );

        if (!response?.url) {
          throw new Error("Checkout failed");
        }

        window.location.href = response.url;
      } catch (error) {
        console.error("Stripe redirect error:", error);
        toast.error(error.message || "Payment error");
      }
    }

    redirectToCheckout();
  }, []); // ✅ run once only

  return (
    <div className="layout_top">
      <div style={{ height: "70vh" }}>
        <Spinner />
      </div>
    </div>
  );
}

Stripe.footer = false;
