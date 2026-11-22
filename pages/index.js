
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

function HomePage({ data, error }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
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

  // Custom Brisbane Surgical Supplies slider banners
  const customSlides = [
    {
      image:
        "https://brisbane-surgical-supplies-assets.s3.eu-north-1.amazonaws.com/CPAP+Therapy+for+Better+Sleep.png",
      alt: "CPAP Therapy for Better Sleep",
      title: "CPAP Therapy for Better Sleep",
      url: "/gallery?category=cpap-masks-and-machines"
    },
    {
      image:
        "https://brisbane-surgical-supplies-assets.s3.eu-north-1.amazonaws.com/CPAP+Masks+and+Machines+Essentials-1.png",
      alt: "CPAP Masks and Machines Essentials",
      title: "CPAP Masks and Machines",
      url: "/gallery?category=cpap-masks-and-machines"
    },
    {
      image:
        "https://brisbane-surgical-supplies-assets.s3.eu-north-1.amazonaws.com/Quit+Smoking%2C+Breathe+Freely-2.png",
      alt: "Quit Smoking, Breathe Freely",
      title: "Quit Smoking, Breathe Freely",
      url: "/gallery"
    }
  ];

  // Automatically change slides every 5 seconds
  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setActiveSlide((current) =>
        (current + 1) % customSlides.length
      );
    }, 5000);

    return () => clearInterval(sliderTimer);
  }, []);

  const previousSlide = () => {
    setActiveSlide((current) =>
      current === 0 ? customSlides.length - 1 : current - 1
    );
  };

  const nextSlide = () => {
    setActiveSlide((current) =>
      (current + 1) % customSlides.length
    );
  };

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

          {/* Brisbane Surgical Supplies Custom Image Slider */}
          <section
            style={{
              width: "100%",
              maxWidth: "1920px",
              margin: "0 auto",
              padding: "0",
              backgroundColor: "#ffffff",
              overflow: "hidden",
              position: "relative"
            }}
          >
            <a
              href={customSlides[activeSlide].url}
              aria-label={customSlides[activeSlide].title}
              style={{
                display: "block",
                width: "100%",
                lineHeight: 0,
                textDecoration: "none"
              }}
            >
              <img
                key={customSlides[activeSlide].image}
                src={customSlides[activeSlide].image}
                alt={customSlides[activeSlide].alt}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxWidth: "1920px",
                  objectFit: "contain",
                  objectPosition: "center",
                  margin: "0 auto"
                }}
              />
            </a>

            {/* Previous Button */}
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous banner"
              style={{
                position: "absolute",
                top: "50%",
                left: "20px",
                transform: "translateY(-50%)",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.85)",
                color: "#123b59",
                fontSize: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)"
              }}
            >
              &#8249;
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next banner"
              style={{
                position: "absolute",
                top: "50%",
                right: "20px",
                transform: "translateY(-50%)",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.85)",
                color: "#123b59",
                fontSize: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)"
              }}
            >
              &#8250;
            </button>

            {/* Slider Indicators */}
            <div
              style={{
                position: "absolute",
                bottom: "15px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              {customSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to banner ${index + 1}`}
                  style={{
                    width: activeSlide === index ? "26px" : "10px",
                    height: "10px",
                    borderRadius: "20px",
                    border: "none",
                    padding: 0,
                    background:
                      activeSlide === index ? "#087f83" : "#b8c5cc",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </div>
          </section>

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
          error: !data.success
        }
      };
    }
);

export default HomePage;
