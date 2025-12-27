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

  const PRODUCT_URL =
    "https://brisbanesurgicalsupplies.com/product/aspire-stride-adjustable-seat-walker-rollator-55su33lm";

  const handleCloseModal = () => {
    router.push("/", undefined, { scroll: false });
    setIsOpen(false);
  };

  useEffect(() => {
    if (router.query.slug) {
      setIsOpen(true);
    }
  }, [router.query.slug]);

  const goToOffer = () => {
    window.location.href = PRODUCT_URL;
  };

  return (
    <>
      {/* 🎄 CHRISTMAS IMAGE TILE BANNER STYLES */}
      <style jsx>{`
        .offer-tile-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 12px 0;
          cursor: pointer;
        }

        .offer-tile {
          max-width: 1200px;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .offer-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25);
        }

        .offer-tile img {
          width: 100%;
          height: auto;
          display: block;
        }

        @media (max-width: 768px) {
          .offer-tile-wrapper {
            margin: 8px 0;
          }

          .offer-tile {
            border-radius: 8px;
          }
        }
      `}</style>

      {error ? (
        <Error500 />
      ) : (
        <>
          <HeadData />

          {/* 🎄 CHRISTMAS IMAGE TILE BANNER */}
          <div className="offer-tile-wrapper" onClick={goToOffer}>
            <div className="offer-tile">
              <img
                src="https://nextlife-store-images.s3.eu-north-1.amazonaws.com/8858987ojxdjvs8898585atbkfrt7cc1e2bd-b40f-4f58-a9f9-b7945cb3d346.png"
                alt="Christmas Special Offer - Aspire Stride Adjustable Seat Walker Rollator"
              />
            </div>
          </div>

          {/* 🔝 HEADER / NAVIGATION */}
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

      {/* 🔒 EXISTING MODAL (UNCHANGED) */}
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
    async ({ req, res, locale, ...etc }) => {
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
