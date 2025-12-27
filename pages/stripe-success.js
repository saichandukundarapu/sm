import { useRouter } from "next/router";
import { useEffect } from "react";

export default function StripeSuccessRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.query.session_id) {
      router.replace(
        `/checkout/success?session_id=${router.query.session_id}`
      );
    }
  }, [router.query.session_id]);

  return null;
}
