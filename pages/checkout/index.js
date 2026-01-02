import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classes from "~/components/Checkout/checkout.module.css";
import HeadData from "~/components/Head";
import { checkPercentage, fetchData, postData } from "~/lib/clientFunctions";
import { applyCoupon, resetCart, updateBillingData } from "~/redux/cart.slice";
import SignIn from "~/components/Auth/signin";

const CheckoutNav = dynamic(() => import("~/components/Checkout/checkoutNav"));
const PaymentGatewayList = dynamic(() =>
  import("~/components/Checkout/paymentGatewayList")
);

const Checkout = () => {
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;
  const dispatch = useDispatch();
  const router = useRouter();
  const { session, status } = useSelector((state) => state.localSession);

  const [visibleTab, setVisibleTab] = useState(1);
  const [changeTab, setChangeTab] = useState(false);

  const [preInfo, setPreInfo] = useState({
    billingInfo: {},
    shippingInfo: {},
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "unauthenticated") setShowLoginModal(true);
  }, [status]);

  const handleChange = (type, field, value) => {
    setPreInfo((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();

    if (!preInfo.billingInfo?.fullName || !preInfo.billingInfo?.email) {
      return toast.warning("Please fill Billing Information");
    }

    dispatch(
      updateBillingData({
        billingInfo: preInfo.billingInfo,
        shippingInfo: preInfo.shippingInfo,
        deliveryInfo: { type: "Default", cost: 0, area: null },
      })
    );

    setVisibleTab(2);
    setChangeTab(true);
  };

  const decimalBalance = (num) => Math.round(num * 10) / 10;

  const getTotalPrice = decimalBalance(
    cartData.items.reduce((a, i) => a + i.qty * i.price, 0)
  );

  async function submitOrder() {
    if (!cartData.items.length)
      return toast.warning("Your cart is empty");

    const formData = new FormData();
    formData.append(
      "checkoutData",
      JSON.stringify({
        products: cartData.items,
        billingInfo: preInfo.billingInfo,
        shippingInfo: preInfo.shippingInfo,
        paymentData: { method: paymentMethod },
      })
    );

    const res = await postData("/api/order/new", formData);

    if (!res?.success) {
      toast.error("Order failed");
      return;
    }

    if (paymentMethod === "stripe") {
      router.push(`/checkout/stripe`);
    } else {
      dispatch(resetCart());
      router.push(`/checkout/success/${res.createdOrder.orderId}`);
    }
  }

  return (
    <>
      <HeadData title="Checkout" />

      <div className={classes.top}>
        <div className={classes.card}>
          <div className="custom_container">
            <CheckoutNav
              tab={visibleTab}
              setTab={setVisibleTab}
              changeTab={changeTab}
            />

            {/* BILLING + SHIPPING */}
            {visibleTab === 1 && (
              <form
                className={classes.checkout_form}
                onSubmit={handleInfoSubmit}
              >
                <div className={classes.box}>
                  {billingInfoJsx()}
                  {shippingInfoJsx()}
                  <button type="submit">Continue</button>
                </div>
              </form>
            )}

            {/* PAYMENT */}
            {visibleTab === 2 && (
              <div className={classes.checkout_form}>
                <div className={classes.box}>
                  <PaymentGatewayList
                    selectPaymentMethod={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    submitOrder={submitOrder}
                    settings={settings.settingsData.paymentGateway}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className={classes.overlay}>
          <SignIn popup hidePopup={() => router.reload()} />
        </div>
      )}
    </>
  );

  function billingInfoJsx() {
    return (
      <>
        <h5>Billing Information</h5>
        {["fullName", "email", "phone", "house", "city", "state", "zipCode"].map(
          (f) => (
            <input
              key={f}
              className="form-control mb-2"
              placeholder={f}
              value={preInfo.billingInfo[f] || ""}
              onChange={(e) =>
                handleChange("billingInfo", f, e.target.value)
              }
              required
            />
          )
        )}
      </>
    );
  }

  function shippingInfoJsx() {
    return (
      <>
        <h5 className="mt-4">Shipping Information</h5>
        {["fullName", "phone", "house", "city", "state", "zipCode"].map((f) => (
          <input
            key={f}
            className="form-control mb-2"
            placeholder={f}
            value={preInfo.shippingInfo[f] || ""}
            onChange={(e) =>
              handleChange("shippingInfo", f, e.target.value)
            }
          />
        ))}
      </>
    );
  }
};

export default Checkout;
