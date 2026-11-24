
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import { useDispatch, useSelector } from "react-redux";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast } from "react-toastify";
import useSWR from "swr";
import ImageLoader from "~/components/Image";
import { fetchData, stockInfo } from "~/lib/clientFunctions";
import { useTranslation } from "react-i18next";
import {
  _simpleProductCart,
  _variableProductCart,
} from "~/lib/cartHandle";
import { useRouter } from "next/router";
import Spinner from "../../Ui/Spinner";
import classes from "./productDetails.module.css";

const Carousel = dynamic(() =>
  import("react-responsive-carousel").then(
    (com) => com.Carousel
  )
);

const ProductDetails = (props) => {
  const router = useRouter();
  const url = `/api/product/${props.productSlug}`;
  const { data, error } = useSWR(url, fetchData);

  const [selectedColor, setSelectedColor] = useState({
    name: null,
    value: null,
  });

  const [selectedAttribute, setSelectedAttribute] = useState({
    name: null,
    value: null,
    for: null,
  });

  const [price, setPrice] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  const dispatch = useDispatch();
  const quantityAmount = useRef();

  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);

  const { t } = useTranslation();

  useEffect(() => {
    if (data && data.product) {
      setPrice(data.product.discount);

      if (data.product.type !== "variable") {
        return;
      }

      if (
        data.product.colors &&
        data.product.colors.length > 0
      ) {
        setSelectedColor({
          name: data.product.colors[0]?.label,
          value: data.product.colors[0]?.value,
        });
      }

      if (
        data.product.attributes &&
        data.product.attributes.length > 0
      ) {
        setSelectedAttribute({
          name: data.product.attributes[0]?.label,
          value: data.product.attributes[0]?.value,
          for: data.product.attributes[0]?.for,
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (data && data.product) {
      const cl = data.product.colors?.length || 0;
      const al = data.product.attributes?.length || 0;

      if (cl > 0 && al > 0) {
        updatePrice(
          selectedColor.name,
          selectedAttribute.name
        );
      }

      if (cl > 0 && al === 0) {
        updatePrice(selectedColor.name, null);
      }

      if (cl === 0 && al > 0) {
        updatePrice(null, selectedAttribute.name);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, selectedAttribute]);

  if (error) {
    return (
      <div className="text-danger">
        Failed to load product
      </div>
    );
  }

  if (!data) return <Spinner />;

  if (!data.product) {
    return <div>Something Went Wrong...</div>;
  }

  const stepUpQty = () => {
    if (quantityAmount.current) {
      quantityAmount.current.stepUp();
    }
  };

  const stepDownQty = () => {
    if (
      quantityAmount.current &&
      Number(quantityAmount.current.value) > 1
    ) {
      quantityAmount.current.stepDown();
    }
  };

  const selectPreviewImage = (vd) => {
    if (vd.imageIndex && vd.imageIndex > 0) {
      setSelectedImage(vd.imageIndex - 1);
    }
  };

  const checkVariantInfo = (color_name, attr_name) => {
    const colorName = color_name || selectedColor.name;
    const attrName = attr_name || selectedAttribute.name;

    return data.product.variants.find(
      (item) =>
        item.color === colorName &&
        item.attr === attrName
    );
  };

  const updatePrice = (color, attr) => {
    const variantData = checkVariantInfo(color, attr);

    if (variantData && variantData.price) {
      const itemPrice =
        data.product.discount +
        Number(variantData.price);

      setPrice(itemPrice);
      selectPreviewImage(variantData);
    }
  };

  const changeColor = (e) => {
    try {
      const value = {
        name: e.label,
        value: e.value,
      };

      setSelectedColor(value);
      updatePrice(value.name, null);
    } catch (err) {
      console.log(err);
    }
  };

  const changeVariant = (e) => {
    try {
      const value = {
        name: e.label,
        value: e.value,
        for: e.for,
      };

      setSelectedAttribute(value);
      updatePrice(null, value.name);
    } catch (err) {
      console.log(err);
    }
  };

  const simpleProductCart = _simpleProductCart(
    data,
    cartData,
    price,
    dispatch
  );

  const checkQty = (
    prevQty,
    currentQty,
    availableQty
  ) => {
    const avQty = Number(availableQty);

    if (avQty === -1) {
      return true;
    } else {
      return prevQty + currentQty <= avQty;
    }
  };

  const variableProductCart = _variableProductCart(
    data,
    selectedColor,
    selectedAttribute,
    cartData,
    checkVariantInfo,
    checkQty,
    price,
    dispatch
  );

  // Add product to cart
  const addItemToCart = () => {
    const qty = Number(quantityAmount.current.value);
    let added = false;

    if (data.product.type === "simple") {
      added = simpleProductCart(qty);
    } else {
      added = variableProductCart(qty);
    }

    if (added) {
      router.push("/cart");
    }
  };

  // Product gallery thumbnails
  const thumbs = () => {
    const thumbList = data.product.gallery.map(
      (item, index) => (
        <ImageLoader
          key={item.name + index}
          src={item.url}
          alt={data.product.name}
          width={67}
          height={67}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      )
    );

    return thumbList;
  };

  return (
    <div
      className={classes.container}
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "clamp(14px, 2.5vw, 28px)",
        border: "1px solid #edf0f4",
        boxShadow: "0 12px 40px rgba(15, 35, 55, 0.07)",
        overflow: "hidden",
      }}
    >
      <div className="row g-4 align-items-start">

        {/* PRODUCT IMAGE */}
        <div className="col-lg-6">
          <div
            className={classes.slider}
            style={{
              background: "#f7fafc",
              border: "1px solid #edf1f5",
              borderRadius: "16px",
              padding: "14px",
              minHeight: "340px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className={classes.image_container_main}
              style={{ width: "100%" }}
            >
              <Carousel
                showArrows={false}
                showThumbs={true}
                showIndicators={false}
                renderThumbs={thumbs}
                showStatus={false}
                emulateTouch={true}
                preventMovementUntilSwipeScrollTolerance={true}
                swipeScrollTolerance={50}
                selectedItem={selectedImage}
              >
                {data.product.gallery.map(
                  (item, index) => (
                    <InnerImageZoom
                      key={item.name + index}
                      src={item.url}
                      className={
                        classes.magnifier_container
                      }
                      fullscreenOnMobile={true}
                    />
                  )
                )}
              </Carousel>
            </div>
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="col-lg-6">
          <div
            className={classes.details}
            style={{
              padding: "8px 8px 8px 16px",
            }}
          >
            {/* UNIT */}
            <p
              className={classes.unit}
              style={{
                color: "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              {data.product.unitValue}{" "}
              {data.product.unit}
            </p>

            {/* PRODUCT NAME */}
            <h1
              className={classes.heading}
              style={{
                color: "#172b4d",
                fontSize: "clamp(22px, 2.5vw, 30px)",
                fontWeight: 750,
                lineHeight: 1.3,
                letterSpacing: "-0.6px",
                marginBottom: "18px",
              }}
            >
              {data.product.name}
            </h1>

            <div
              style={{
                height: "1px",
                background: "#e9edf2",
                marginBottom: "20px",
              }}
            />

            {/* PRICE */}
            <div style={{ marginBottom: "20px" }}>
              {data.product.discount <
                data.product.price && (
                <p
                  className={classes.price_ori}
                  style={{
                    color: "#94a3b8",
                    fontSize: "15px",
                    textDecoration: "line-through",
                    marginBottom: "5px",
                  }}
                >
                  {settings.settingsData.currency.symbol}
                  {data.product.price}
                </p>
              )}

              <p
                className={classes.price}
                style={{
                  color: "#059669",
                  fontSize: "30px",
                  fontWeight: 750,
                  letterSpacing: "-0.5px",
                  margin: 0,
                }}
              >
                {settings.settingsData.currency.symbol}
                {price}
              </p>
            </div>

            {/* DESCRIPTION */}
            <p
              className={classes.description}
              style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: 1.8,
                marginBottom: "22px",
              }}
            >
              {data.product.shortDescription}
            </p>

            {/* VARIABLE PRODUCT OPTIONS */}
            {data.product.type === "variable" && (
              <div style={{ marginBottom: "20px" }}>
                {data.product.colors.length > 0 && (
                  <div className={classes.color_selector}>
                    <p
                      className={classes.section_heading}
                      style={{
                        color: "#475569",
                        fontWeight: 700,
                        marginBottom: "11px",
                      }}
                    >
                      {t("color")}
                    </p>

                    <div
                      className={
                        classes.color_selector_container
                      }
                    >
                      {data.product.colors.map(
                        (color, i) => (
                          <div
                            className={classes.circle_outer}
                            key={i}
                            onClick={() =>
                              changeColor(color)
                            }
                            title={color.name}
                          >
                            <label
                              data-selected={
                                color.value ===
                                selectedColor.value
                              }
                              style={{
                                backgroundColor: color.value,
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {data.product.attributes.length > 0 && (
                  <div>
                    <p
                      className={classes.section_heading}
                      style={{
                        color: "#475569",
                        fontWeight: 700,
                      }}
                    >
                      {data.product.attributes[0]?.for}
                    </p>

                    <div className={classes.select}>
                      {data.product.attributes.map(
                        (attr, i) => (
                          <span
                            key={i}
                            className={classes.attr}
                            onClick={() =>
                              changeVariant(attr)
                            }
                            data-selected={
                              attr.label ===
                              selectedAttribute.name
                            }
                          >
                            {attr.label}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORY DISPLAY REMOVED */}

            {/* QUANTITY AND CART */}
            <div
              className={classes.cart_section}
              style={{
                borderTop: "1px solid #edf0f4",
                paddingTop: "20px",
                marginTop: "12px",
              }}
            >
              <p
                className={classes.section_heading}
                style={{
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  marginBottom: "11px",
                }}
              >
                QUANTITY
              </p>

              <div
                className="d-flex flex-wrap align-items-center"
                style={{ gap: "12px" }}
              >
                {/* QUANTITY SELECTOR */}
                <div
                  className={classes.number_input}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "48px",
                    overflow: "hidden",
                    border: "1px solid #dbe2ea",
                    borderRadius: "11px",
                    background: "#ffffff",
                  }}
                >
                  <button
                    type="button"
                    onClick={stepDownQty}
                    className={classes.minus}
                    style={{
                      width: "40px",
                      height: "48px",
                      border: 0,
                      background: "#f1f5f9",
                      color: "#172b4d",
                      fontSize: "21px",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>

                  <input
                    className={classes.quantity}
                    ref={quantityAmount}
                    min="1"
                    max={
                      data.product.quantity === -1
                        ? 100000
                        : data.product.quantity
                    }
                    defaultValue="1"
                    type="number"
                    style={{
                      width: "48px",
                      height: "48px",
                      textAlign: "center",
                      border: 0,
                      background: "#ffffff",
                      color: "#172b4d",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  />

                  <button
                    type="button"
                    onClick={stepUpQty}
                    className={classes.plus}
                    style={{
                      width: "40px",
                      height: "48px",
                      border: 0,
                      background: "#f1f5f9",
                      color: "#172b4d",
                      fontSize: "21px",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* ADD TO CART */}
                <div style={{ flex: "1 1 160px" }}>
                  {stockInfo(data.product) ? (
                    <button
                      className={classes.cart_button}
                      onClick={() => addItemToCart()}
                      style={{
                        width: "100%",
                        minHeight: "48px",
                        border: 0,
                        borderRadius: "11px",
                        background: "#d90429",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.4px",
                        cursor: "pointer",
                        boxShadow:
                          "0 5px 14px rgba(217, 4, 41, 0.15)",
                      }}
                    >
                      {t("add_to_cart")}
                    </button>
                  ) : (
                    <button
                      className={classes.cart_button}
                      disabled
                      style={{
                        width: "100%",
                        minHeight: "48px",
                        border: 0,
                        borderRadius: "11px",
                        background: "#94a3b8",
                        color: "#ffffff",
                        fontWeight: 700,
                      }}
                    >
                      {t("out_of_stock")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
