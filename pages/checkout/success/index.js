import { useRouter } from "next/router";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const Spinner = dynamic(() => import("~/components/Ui/Spinner"));

export default function StripeSuccessIndex() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    if (session_id) {
      router.replace(`/checkout/success/${session_id}`);
    }
  }, [router.isReady, session_id]);

  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
      <Spinner />
    </div>
  );
}
