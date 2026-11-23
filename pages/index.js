
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HeadData from "~/components/Head";
import { setSettingsData } from "~/lib/clientFunctions";
import homePageData from "~/lib/dataLoader/home";
import { wrapper } from "~/redux/store";
import Link from "next/link";

const Error500 = dynamic(() => import("~/components/error/500"));
const Header = dynamic(() => import("~/components/Header/header"));
const Banner = dynamic(() => import("~/components/Banner/banner"));

const CategoryList = dynamic(() =>
  import("~/components/Categories/categoriesList")
);

const Collection = dynamic(() =>
  import("~/components/Collection/collection")
);

const BrandCardList = dynamic(() =>
  import("~/components/Brand/brandList")
);

const ProductDetails = dynamic(() =>
  import("~/components/Shop/Product/productDetails")
);

const ProductList = dynamic(() =>
  import("~/components/ProductListView")
);

const GlobalModal = dynamic(() =>
  import("~/components/Ui/Modal/modal")
);

const QuitSmokingSection = dynamic(() =>
  import("~/components/QuitSmokingSection")
);

function HomePage({ data, error }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleCloseModal = () => {
    router.push("/", undefined, { scroll: false });
    setIsOpen(false);
  };

  useEffect(() => {
    if (router.query.slug) {
      setIsOpen(true);
    }
  }, [router.query.slug]);

  return (
    <>
      {error ? (
        <Error500 />
      ) : (
        <>
          <HeadData />

          {/* Existing Header and Carousel */}
          <Header
            carousel={
              data.additional &&
              data.additional.homePage.carousel
            }
          />

          {/* Existing Categories */}
          <CategoryList categoryList={data.category} />

          {/* Existing New Products */}
          <ProductList
            title={t("new_products")}
            type="new"
          />

          <div className="content_spacing" />

          {/* Existing Homepage Banner */}
          <Banner
            banner={
              data.additional &&
              data.additional.homePage.banner
            }
          />

          {/* Existing Trending Products */}
          <ProductList
            title={t("trending_products")}
            type="trending"
          />

          <div className="content_spacing" />

          {/* Existing Collections */}
          <Collection
            data={
              data.additional &&
              data.additional.homePage.collection
            }
          />

          {/* Existing Best Selling Products */}
          <ProductList
            title={t("best_selling")}
            type="bestselling"
          />

          {/* Quit Smoking Section */}
          <QuitSmokingSection />

          {/* Quit Smoking Page Link Banner */}
          <div
            style={{
              margin: "35px auto",
              maxWidth: "1200px",
              padding: "35px 25px",
              borderRadius: "16px",
              background:
                "linear-gradient(110deg, #e7f7ef, #eef6ff)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ maxWidth: "700px" }}>
              <h2
                style={{
                  color: "#193d38",
                  fontSize: "26px",
                  fontWeight: "800",
                  margin: "0 0 10px",
                }}
              >
                Ready to Explore Smoking Cessation Support?
              </h2>

              <p
                style={{
                  color: "#667b77",
                  fontSize: "15px",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                Explore helpful information, nicotine replacement
                therapy resources and professional guidance.
              </p>
            </div>

            <Link
              href="/quit-smoking"
              style={{
                display: "inline-block",
                padding: "14px 25px",
                background: "#15976c",
                color: "#ffffff",
                borderRadius: "7px",
                textDecoration: "none",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              Explore Quit Smoking →
            </Link>
          </div>

          {/* Existing Brands */}
          <BrandCardList items={data.brand || []} />

          <div className="content_spacing" />
        </>
      )}

      {/* Existing Product Modal */}
      <GlobalModal
        small={false}
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
      >
        {router.query.slug && (
          <ProductDetails
            productSlug={router.query.slug}
          />
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
