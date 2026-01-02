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
      {/* 🔥 TOP OFFER SLIDER STYLES */}
      <style jsx>{`
        .offer-slider-wrapper {
          width: 100%;
          margin: 12px 0;
          overflow: hidden;
        }

        .offer-slider {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .offer-slide {
          flex: 0 0 100%;
          max-width: 1200px;
          margin: auto;
          scroll-snap-align: center;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .offer-slide:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25);
        }

        .offer-slide img {
          width: 100%;
          height: auto;
          display: block;
        }

        @media (max-width: 768px) {
          .offer-slide {
            border-radius: 8px;
          }
        }
      `}</style>

      {error ? (
        <Error500 />
      ) : (
        <>
          <HeadData />

          {/* 🔥 TOP PROMOTIONAL SLIDER */}
          <div className="offer-slider-wrapper">
            <div className="offer-slider">
              {/* SLIDE 1 */}
              <div
                className="offer-slide"
                onClick={() =>
                  (window.location.href =
                    "https://brisbanesurgicalsupplies.com/product/aspire-stride-adjustable-seat-walker-rollator-55su33lm")
                }
              >
                <img
                  src="https://nextlife-store-images.s3.eu-north-1.amazonaws.com/8858987ojxdjvs8898585atbkfrt7cc1e2bd-b40f-4f58-a9f9-b7945cb3d346.png"
                  alt="Aspire Stride Adjustable Seat Walker Rollator Offer"
                />
              </div>

              {/* SLIDE 2 */}
              <div
                className="offer-slide"
                onClick={() =>
                  (window.location.href =
                    "https://brisbanesurgicalsupplies.com/product/resmed-airsense-11-autoset-cpap-machine-55ll05kv")
                }
              >
                <img
                  src="https://nextlife-store-images.s3.eu-north-1.amazonaws.com/3000107kobzocy1330231bnbckyoimage_2026-01-02_134517418.png"
                  alt="ResMed AirSense 11 AutoSet CPAP Machine Offer"
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

      {/* 🔒 PRODUCT QUICK VIEW MODAL */}
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
