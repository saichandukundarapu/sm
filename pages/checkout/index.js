
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import classes from "~/components/Checkout/checkout.module.css";
import HeadData from "~/components/Head";
import { checkPercentage, postData } from "~/lib/clientFunctions";
import { applyCoupon, resetCart } from "~/redux/cart.slice";

const ImageLoader = dynamic(() => import("~/components/Image"));

const emptyAddress = {
  fullName: "",
  email: "",
  phone: "",
  house: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Australia",
};

const Checkout = () => {
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);

  const currencySymbol =
    settings?.settingsData?.currency?.symbol || "$";

  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const [customer, setCustomer] = useState(emptyAddress);
  const [couponCode, setCouponCode] = useState(
    cartData?.coupon?.code || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartData?.billingInfo?.fullName) {
      setCustomer({
        ...emptyAddress,
        ...cartData.billingInfo,
      });
    }
  }, [cartData?.loaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const decimalBalance = (num) =>
    Math.round((Number(num) || 0) * 10) / 10;

  const getTotalPrice = decimalBalance(
    (cartData.items || []).reduce(
      (acc, item) => acc + item.qty * item.price,
      0
    )
  );

  const discountPrice =
    ((cartData.coupon?.discount || 0) / 100) * getTotalPrice;

  const getTotalVat = decimalBalance(
    (cartData.items || []).reduce(
      (acc, item) =>
        acc +
        checkPercentage(
          item.qty * item.price,
          item.vat || 0
        ),
      0
    )
  );

  const getTotalTax = decimalBalance(
    (cartData.items || []).reduce(
      (acc, item) =>
        acc +
        checkPercentage(
          item.qty * item.price,
          item.tax || 0
        ),
      0
    )
  );

  const finalPrice = decimalBalance(
    getTotalPrice +
      getTotalVat +
      getTotalTax -
      discountPrice
  );

  const checkCoupon = async () => {
    if (!couponCode.trim()) {
      return toast.warning("Please enter a coupon code");
    }

    try {
      const data = await postData("/api/order/coupon", {
        code: couponCode.trim(),
      });

      if (data?.success) {
        dispatch(
          applyCoupon({
            code: data.code,
            discount: data.discount,
          })
        );

        toast.success(data.message);
      } else {
        toast.error(data?.message || "Invalid coupon");
      }
    } catch (error) {
      toast.error("Unable to apply coupon");
    }
  };

  const submitOrder = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!cartData.items || cartData.items.length === 0) {
      return toast.warning("Your cart is empty");
    }

    const requiredFields = [
      ["fullName", "Please enter your full name"],
      ["email", "Please enter your email"],
      ["phone", "Please enter your phone number"],
      ["house", "Please enter your street address"],
      ["city", "Please enter your suburb or city"],
      ["state", "Please enter your state"],
      ["zipCode", "Please enter your postcode"],
      ["country", "Please enter your country"],
    ];

    for (const [field, message] of requiredFields) {
      if (!String(customer[field] || "").trim()) {
        return toast.warning(message);
      }
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(customer.email)) {
      return toast.warning("Please enter a valid email address");
    }

    const customerInfo = {
      ...customer,
      fullName: customer.fullName.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
    };

    const orderData = {
      coupon: cartData.coupon || {
        code: "",
        discount: 0,
      },
      products: cartData.items,
      billingInfo: customerInfo,
      shippingInfo: customerInfo,
      deliveryInfo: {
        type: "Default",
        cost: 0,
        area: null,
      },
      paymentData: {
        method: "Order Request",
        id: null,
      },
    };

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "checkoutData",
        JSON.stringify(orderData)
      );

      const response = await postData(
        "/api/order/new",
        formData
      );

      if (response?.success && response.createdOrder?._id) {
        const orderReference =
          response.createdOrder.orderId;

        dispatch(resetCart());

        toast.success("Your order request has been submitted!");

        router.push(
          `/checkout/success/${response.createdOrder._id}`
        );
      } else {
        toast.error(
          response?.message ||
            "Unable to submit your order. Please try again."
        );
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeadData title="Guest Checkout" />

      <div className={classes.top}>
        <div className={classes.card}>
          <div className="custom_container">
            <div className="row">
              <div className="col-lg-7">
                <div className={classes.box}>
                  <h4 className="mb-3">
                    Guest Checkout
                  </h4>

                  <p>
                    Enter your contact and delivery details.
                    No account is required.
                  </p>

                  <form onSubmit={submitOrder}>
                    <h5 className="mt-4 mb-3">
                      Customer Information
                    </h5>

                    <div className="mb-3">
                      <label className="form-label">
                        Full Name *
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="fullName"
                        value={customer.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Email Address *
                      </label>
                      <input
                        className="form-control"
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Phone Number *
                      </label>
                      <input
                        className="form-control"
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <h5 className="mt-4 mb-3">
                      Delivery Address
                    </h5>

                    <div className="mb-3">
                      <label className="form-label">
                        Street Address *
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="house"
                        value={customer.house}
                        onChange={handleChange}
                        placeholder="House number and street"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Suburb / City *
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="city"
                        value={customer.city}
                        onChange={handleChange}
                        placeholder="Suburb or city"
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          State *
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="state"
                          value={customer.state}
                          onChange={handleChange}
                          placeholder="State"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Postcode *
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="zipCode"
                          value={customer.zipCode}
                          onChange={handleChange}
                          placeholder="Postcode"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Country *
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="country"
                        value={customer.country}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <div className="alert alert-info">
                        This is an order request, not an
                        online payment. Our team will contact
                        you to confirm your order and complete
                        the purchase.
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                      >
                        {loading
                          ? "Submitting..."
                          : "Submit Order Request"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-lg-5">
                <div className={classes.box}>
                  <h5 className="mt-3">
                    {t("items_in_your_cart")}
                  </h5>

                  <div className={classes.cart_item_list}>
                    <table className="table">
                      <thead
                        className={classes.cart_item_header}
                      >
                        <tr>
                          <th>Product</th>
                          <th className="text-end">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {(cartData.items || []).map(
                          (item, index) => (
                            <tr
                              className={classes.cart_item}
                              key={item.uid || item._id || index}
                            >
                              <td>
                                <div
                                  className={classes.cart_container}
                                >
                                  <span
                                    className={classes.cart_image}
                                  >
                                    <ImageLoader
                                      src={item.image?.[0]?.url}
                                      height={50}
                                      width={50}
                                      alt={item.name}
                                    />
                                  </span>

                                  <span
                                    className={classes.cart_disc}
                                  >
                                    <b>{item.name}</b>

                                    {item.color?.name && (
                                      <span>
                                        Color: {item.color.name}
                                      </span>
                                    )}

                                    {item.attribute?.name && (
                                      <span>
                                        {item.attribute.for}:{" "}
                                        {item.attribute.name}
                                      </span>
                                    )}

                                    <span>
                                      Qty: {item.qty}
                                    </span>
                                  </span>
                                </div>
                              </td>

                              <td className="text-end">
                                {currencySymbol}
                                {decimalBalance(
                                  item.qty * item.price
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    <table className={classes.priceTable}>
                      <tbody>
                        <tr>
                          <td>Subtotal:</td>
                          <td className="text-end">
                            {currencySymbol}
                            {getTotalPrice}
                          </td>
                        </tr>

                        <tr>
                          <td>Tax:</td>
                          <td className="text-end">
                            {currencySymbol}
                            {getTotalTax}
                          </td>
                        </tr>

                        <tr>
                          <td>VAT:</td>
                          <td className="text-end">
                            {currencySymbol}
                            {getTotalVat}
                          </td>
                        </tr>

                        <tr>
                          <td>Discount:</td>
                          <td className="text-end">
                            {currencySymbol}
                            {decimalBalance(discountPrice)}
                          </td>
                        </tr>

                        <tr>
                          <td>Delivery:</td>
                          <td className="text-end">
                            {currencySymbol}0
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Total:</strong>
                          </td>
                          <td className="text-end">
                            <strong>
                              {currencySymbol}
                              {finalPrice}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="input-group mt-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value)
                      }
                      className="form-control"
                      placeholder="Enter promo code"
                    />

                    <button
                      type="button"
                      onClick={checkCoupon}
                    >
                      Apply Discount
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
