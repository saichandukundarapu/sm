import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { postData } from "~/lib/clientFunctions";
import { resetCart } from "../../redux/cart.slice";
import classes from "./stripe.module.css";

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const cartData = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ⬇️ Create order in backend and redirect to success page
  const processOrder = async () => {
    try {
      const { coupon, items, billingInfo, shippingInfo, deliveryInfo } =
        cartData;

      const data = {
        coupon,
        products: items,
        billingInfo,
        shippingInfo,
        deliveryInfo,
        paymentData: {
          method: "Stripe",
          id: null, // you can later pass paymentIntent.id if you want
        },
      };

      const url = `/api/order/new`;
      const formData = new FormData();
      formData.append("checkoutData", JSON.stringify(data));
      const responseData = await postData(url, formData);

      if (responseData && responseData.success) {
        dispatch(resetCart());
        toast.success("Order successfully placed");
        setTimeout(() => {
          router.push(`/checkout/success/${responseData.createdOrder._id}`);
        }, 2300);
        return responseData;
      } else {
        toast.error("Something Went Wrong (500)");
        return null;
      }
    } catch (err) {
      toast.error(`Something Went Wrong ${err}`);
      console.log(err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    // ⭐ Handle success directly here – no manual refresh, no URL parsing needed
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Used only if Stripe really needs a redirect (some payment methods)
        return_url: `${process.env.NEXT_PUBLIC_URL}/checkout/stripe`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occured.");
      }
    } else if (paymentIntent) {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          await processOrder(); // ⬅️ create order + redirect to success
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    }

    setIsLoading(false);
  };

  return (
    <div className={classes.body}>
      <form id="payment-form" onSubmit={handleSubmit} className={classes.form}>
        <PaymentElement
          id="payment-element"
          className={classes.payment_element}
        />
        <button disabled={isLoading || !stripe || !elements} id="submit">
          <span id="button-text">
            {isLoading ? (
              <div className={classes.spinner} id="spinner"></div>
            ) : (
              `Pay ${props.price} USD`
            )}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && (
          <div id="payment-message" className={classes.payment_message}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
