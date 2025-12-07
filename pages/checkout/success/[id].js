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

const OrderSuccessPage = () => {
  const [orderData, setOrderData] = useState({});
  const router = useRouter();
  const { t } = useTranslation();

  const url = `/api/home/order?id=${router.query.id}`;

  // ⭐ REFETCH UNTIL ORDER IS READY (no more manual refresh!)
  const { data, error } = useSWR(
    router.query.id ? url : null,
    fetchData,
    {
      refreshInterval: 1000,     // Re-check every 1 second
      dedupingInterval: 500,     // Prevent unnecessary duplicates
      shouldRetryOnError: true,
    }
  );

  // When API returns the order, update state
  useEffect(() => {
    if (data?.order) {
      setOrderData(data.order);
    }
  }, [data]);

  async function printDoc() {
    const { printDocument } = await import("~/lib/clientFunctions");
    await printDocument(orderData);
  }

  return (
    <>
      {error ? (
        <Error500 />
      ) : !data ? (
        <div style={{ height: "100vh" }}>
          <Spinner />
        </div>
      ) : !orderData.orderId ? (
        // If order is not ready yet, show loading instead of 404
        <div style={{ height: "100vh" }}>
          <Spinner />
        </div>
      ) : (
        <div className={classes.top}>
          <div className={classes.mx}>
            <CheckoutNav tab={3} setTab={() => {}} changeTab={false} />

            <div className={`${classes.card} mt-5`}>
              <Invoice data={orderData} />

              <div className="py-2">
                <div className="row">
                  <div className="col-md-6">
                    <button className="mt-3" onClick={printDoc}>
                      {t("download_invoice")}
                    </button>
                  </div>

                  <div className="col-md-6">
                    <Link href="/gallery" passHref>
                      <button className="mt-3">{t("continue_shopping")}</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="inv_content"
              style={{
                minHeight: "max-content",
                display: "none",
              }}
            >
              {orderData.orderId && <InvoicePrint data={orderData} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderSuccessPage;
