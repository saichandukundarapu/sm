import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HeadData from "~/components/Head";
import { setSettingsData } from "~/lib/clientFunctions";
import homePageData from "~/lib/dataLoader/home";
import { wrapper } from "~/redux/store";

const Error500 = dynamic(() => import("~/components/error/500"));
const Header = dynamic(() => import("~/components/Header/header"));
const Banner = dynamic(() => import("~/components/Banner/banner"));
const CategoryList = dynamic(() =>
  import("~/components/Categories/categoriesList")
);
const Collection = dynamic(() => import("~/components/Collection/collection"));
const BrandCardList = dynamic(() => import("~/components/Brand/brandList"));
const ProductDetails = dynamic(() =>
  import("~/components/Shop/Product/productDetails")
);
const ProductList = dynamic(() => import("~/components/ProductListView"));
const GlobalModal = dynamic(() => import("~/components/Ui/Modal/modal"));

function HomePage({ data, error }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (router.query.slug) {
      setIsOpen(true);
    }
  }, [router.query.slug]);

  const handleCloseModal = () => {
    router.push("/", undefined, { scroll: false });
    setIsOpen(false);
  };

  return (
    <>
      {/* 🧩 AMAZON-STYLE OFFER TILES (NO CROPPING) */}
      <style jsx>{`
        .offer-section {
          max-width: 1200px;
          margin: 16px auto;
          padding: 0 12px;
        }

        .offer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .offer-card {
          background: #fff;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          padding: 8px;
        }

        .offer-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
        }

        /* ✅ FULL IMAGE VISIBILITY */
        .offer-card img {
          width: 100%;
          height: auto;
          max-height: 260px;
          object-fit: contain;
          display: block;
          background: #fff;
        }

        /* 📱 Mobile: horizontal slider */
        @media (max-width: 768px) {
          .offer-grid {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 12px;
          }

          .offer-card {
            min-width: 85%;
            scroll-snap-align: center;
          }

          .offer-card img {
            max-height: 200px;
          }
        }
      `}</style>

      {error ? (
        <Error500 />
      ) : (
        <>
          <HeadData />

          {/* 🔥 TOP PROMOTIONAL OFFERS */}
          <div className="offer-section">
            <div className="offer-grid">
              {/* OFFER 1 */}
              <div
                className="offer-card"
                onClick={() =>
                  (window.location.href =
                    "https://brisbanesurgicalsupplies.com/product/aspire-stride-adjustable-seat-walker-rollator-55su33lm")
                }
              >
                <img
                  src="https://nextlife-store-images.s3.eu-north-1.amazonaws.com/8858987ojxdjvs8898585atbkfrt7cc1e2bd-b40f-4f58-a9f9-b7945cb3d346.png"
                  alt="Aspire Stride Adjustable Seat Walker Rollator"
                />
              </div>

              {/* OFFER 2 */}
              <div
                className="offer-card"
                onClick={() =>
                  (window.location.href =
                    "https://brisbanesurgicalsupplies.com/product/resmed-airsense-11-autoset-cpap-machine-55ll05kv")
                }
              >
                <img
                  src="https://nextlife-store-images.s3.eu-north-1.amazonaws.com/3000107kobzocy1330231bnbckyoimage_2026-01-02_134517418.png"
                  alt="ResMed AirSense 11 AutoSet CPAP Machine"
                />
              </div>
            </div>
          </div>

          {/* 🔝 HEADER */}
          <Header
            carousel={data.additional && data.additional.homePage.carousel}
          />

          <CategoryList categoryList={data.category} />

          <ProductList title={t("new_products")} type="new" />
          <div className="content_spacing" />

          <Banner
            banner={data.additional && data.additional.homePage.banner}
          />

          <ProductList title={t("trending_products")} type="trending" />
          <div className="content_spacing" />

          <Collection
            data={data.additional && data.additional.homePage.collection}
          />

          <ProductList title={t("best_selling")} type="bestselling" />

          <BrandCardList items={data.brand || []} />
          <div className="content_spacing" />
        </>
      )}

      {/* 🔒 QUICK VIEW MODAL */}
      <GlobalModal
        small={false}
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
      >
        {router.query.slug && (
          <ProductDetails productSlug={router.query.slug} />
        )}
      </GlobalModal>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ res }) => {
      if (res) {
        res.setHeader(
          "Cache-Control",
          "public, s-maxage=10800, stale-while-revalidate=59"
        );
      }

      const _data = await homePageData();
      const data = JSON.parse(JSON.stringify(_data));

      if (data.success) {
        setSettingsData(store, data);
      }

      return {
        props: {
          data,
          error: !data.success,
        },
      };
    }
);

export default HomePage;
