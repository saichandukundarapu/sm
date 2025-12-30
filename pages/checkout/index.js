import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classes from "~/components/Checkout/checkout.module.css";
import NewAddress from "~/components/Profile/addressForm";
import HeadData from "~/components/Head";
import GlobalModal from "~/components/Ui/Modal/modal";
import { checkPercentage, fetchData, postData } from "~/lib/clientFunctions";
import { applyCoupon, resetCart, updateBillingData } from "~/redux/cart.slice";
import SignIn from "~/components/Auth/signin";

const CheckoutNav = dynamic(() => import("~/components/Checkout/checkoutNav"));
const PaymentGatewayList = dynamic(() =>
  import("~/components/Checkout/paymentGatewayList")
);
const ImageLoader = dynamic(() => import("~/components/Image"));

const Checkout = () => {
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;
  const dispatch = useDispatch();
  const router = useRouter();
  const couponCode = useRef("");
  const { session, status } = useSelector((state) => state.localSession);

  const [visibleTab, setVisibleTab] = useState(1);
  const [changeTab, setChangeTab] = useState(false);
  const [sameShippingAddressValue, setSameShippingAddressValue] =
    useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    type: "Default",
    cost: 0,
    area: null,
  });

  const [_address, _setAddress] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [shippingId, setShippingId] = useState("");
  const [hasMainAddress, setHasMainAddress] = useState(false);

  const [preInfo, setPreInfo] = useState({
    billingInfo: {},
    shippingInfo: {},
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState(false);
  const infoForm = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "unauthenticated") setShowLoginModal(true);
  }, [status]);

  async function fetchAddress() {
    const response = await fetchData(`/api/profile/address`);
    if (response.success && response.user?.address) {
      _setAddress(response.user.address);
      const main = response.user.address.find(
        (e) => e.addressType === "main address"
      );

      if (main) {
        const data = {
          fullName: main.name,
          phone: main.phone,
          email: main.email,
          house: main.house,
          city: main.city,
          state: main.state,
          zipCode: main.zipCode,
          country: main.country,
          addressTitle: main.addressTitle,
        };

        setPreInfo({ billingInfo: data, shippingInfo: data });
        setAddressId(main._id);
        setShippingId(main._id);
        setHasMainAddress(true);
      }
    }
  }

  useEffect(() => {
    fetchAddress();
  }, []);

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (!preInfo.billingInfo?.fullName)
      return toast.warning("Please update billing info");

    dispatch(
      updateBillingData({
        billingInfo: preInfo.billingInfo,
        shippingInfo: preInfo.shippingInfo,
        deliveryInfo,
      })
    );

    setVisibleTab(2);
    setChangeTab(true);
  };

  const decimalBalance = (num) => Math.round(num * 10) / 10;

  const getTotalPrice = decimalBalance(
    cartData.items.reduce((a, i) => a + i.qty * i.price, 0)
  );

  const discountPrice = (cartData.coupon.discount / 100) * getTotalPrice;

  const getTotalVat = decimalBalance(
    cartData.items.reduce(
      (a, i) => a + checkPercentage(i.qty * i.price, i.vat),
      0
    )
  );

  const getTotalTax = decimalBalance(
    cartData.items.reduce(
      (a, i) => a + checkPercentage(i.qty * i.price, i.tax),
      0
    )
  );

  const finalPrice =
    getTotalPrice + getTotalVat + getTotalTax - discountPrice;

  async function createOrderAndRedirect(method) {
    const data = {
      coupon: cartData.coupon,
      products: cartData.items,
      billingInfo: preInfo.billingInfo,
      shippingInfo: preInfo.shippingInfo,
      deliveryInfo,
      paymentData: { method, id: null },
    };

    const formData = new FormData();
    formData.append("checkoutData", JSON.stringify(data));

    const response = await postData("/api/order/new", formData);

    if (!response?.success) {
      toast.error(response.message || "Order creation failed");
      return;
    }

    const orderId = response.createdOrder.orderId;

    if (method === "Stripe") {
      router.push(`/checkout/stripe?orderId=${orderId}`);
    } else {
      dispatch(resetCart());
      toast.success("Order placed successfully");
      router.push(`/checkout/success/${orderId}`);
    }
  }

  const submitOrder = async () => {
    if (!cartData.items.length)
      return toast.warning("Your cart is empty");

    if (paymentMethod === "cod") {
      await createOrderAndRedirect("Cash On Delivery");
    } else if (paymentMethod === "wallet") {
      await createOrderAndRedirect("Wallet");
    } else if (paymentMethod === "stripe") {
      await createOrderAndRedirect("Stripe");
    }
  };

  return (
    <>
      <HeadData title="Checkout" />

      <div className={classes.top}>
        <div className={classes.card}>
          <div className="custom_container">
            <div className="row">
              <div className="col-lg-7">
                <CheckoutNav
                  tab={visibleTab}
                  setTab={setVisibleTab}
                  changeTab={changeTab}
                />

                <form
                  onSubmit={handleInfoSubmit}
                  style={{ display: visibleTab === 1 ? "block" : "none" }}
                  className={classes.checkout_form}
                >
                  <div className={classes.box}>
                    {billingInfoJsx()}
                    {!sameShippingAddressValue && shippingInfoJsx()}
                    <button type="submit">{t("continue")}</button>
                  </div>
                </form>

                <div
                  className={classes.checkout_form}
                  style={{ display: visibleTab === 2 ? "block" : "none" }}
                >
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
              </div>

              <div className="col-lg-5">
                <div className={classes.box}>{reviewJsx()}</div>
              </div>
            </div>
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

  function reviewJsx() {
    return (
      <div>
        <h5>{t("items_in_your_cart")}</h5>
        {cartData.items.map((item, i) => (
          <p key={i}>
            {item.name} × {item.qty}
          </p>
        ))}
        <h6>
          {t("total")}: {currencySymbol}
          {decimalBalance(finalPrice)}
        </h6>
      </div>
    );
  }

  function shippingInfoJsx() {
    return null;
  }

  function billingInfoJsx() {
    return null;
  }
};

export default Checkout;
