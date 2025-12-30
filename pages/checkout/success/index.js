import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import classes from "~/components/Checkout/checkout.module.css";
import { fetchData } from "~/lib/clientFunctions";

const CheckoutNav = dynamic(() => import("~/components/Checkout/checkoutNav"));
const Invoice = dynamic(() => import("~/components/Invoice"));
const InvoicePrint = dynamic(() => import("~/components/Invoice/print"));
const Spinner = dynamic(() => import("~/components/Ui/Spinner"));
const Error500 = dynamic(() => import("~/components/error/500"));
const Error404 = dynamic(() => import("~/components/error/404"));
const Link = dynamic(() => import("next/link"));

export default function OrderSuccessPage() {
  const [orderData, setOrderData] = useState({});
  const router = useRouter();
  const { t } = useTranslation();

  // Wait until router is ready
  if (!router.isReady) return null;

  const { id, session_id } = router.query;

  // Support both COD (/checkout/success/[id]) and Stripe (/checkout/success?session_id=)
  const url = id
    ? `/api/home/order?id=${id}`
    : session_id
    ? `/api/home/order?session_id=${session_id}`
    : null;

  const { data, error } = useSWR(url, fetchData);

  // Load order data
  useEffect(() => {
    if (data?.order) {
      setOrderData(data.order);
    }
  }, [data]);

  // Error state
  if (error) return <Error500 />;

  // Loading state
  if (!data) {
    return (
      <div style={{ height: "100vh" }}>
        <Spinner />
      </div>
    );
  }

  // Order not found
  if (!orderData?._id) return <Error404 />;

  async function printDoc() {
    const { printDocument } = await import("~/lib/clientFunctions");
    await printDocument(orderData);
  }

  return (
    <div className={classes.top}>
      <div className={classes.mx}>
        <CheckoutNav tab={3} setTab={() => {}} changeTab={false} />

        <div className={`${classes.card} mt-5`}>
          <Invoice data={orderData} />

          <div className="py-2">
            <div className="row">
              <div className="col-md-6">
                <button
                  className="mt-3"
                  onClick={printDoc}
                  disabled={!orderData?._id}
                >
                  {t("download_invoice")}
                </button>
              </div>

              <div className="col-md-6">
                <Link href="/gallery">
                  <button className="mt-3">
                    {t("continue_shopping")}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden printable invoice */}
        <div id="inv_content" style={{ display: "none" }}>
          <InvoicePrint data={orderData} />
        </div>
      </div>
    </div>
  );
}
