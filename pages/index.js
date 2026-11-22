
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

          {/* Website Header */}
          <Header />

          {/* Custom Brisbane Surgical Supplies Hero Banner */}
          <section
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              overflow: "hidden",
              padding: "0",
              margin: "0 auto"
            }}
          >
            <a
              href="/shop"
              aria-label="Shop Brisbane Surgical Supplies"
              style={{
                display: "block",
                width: "100%",
                lineHeight: 0
              }}
            >
              <img
                src="https://brisbane-surgical-supplies-assets.s3.eu-north-1.amazonaws.com/7252755osgqfmp6266577skjszrnPremium+Medical+Supplies+Banner.png"
                alt="Brisbane Surgical Supplies - Premium Medical and Surgical Supplies"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxWidth: "1920px",
                  margin: "0 auto",
                  objectFit: "contain"
                }}
              />
            </a>
          </section>

          {/* Homepage Categories */}
          <CategoryList categoryList={data.category} />

          {/* New Products */}
          <ProductList title={t("new_products")} type="new" />

          <div className="content_spacing" />

          {/* Existing Banner */}
          <Banner
            banner={data.additional && data.additional.homePage.banner}
          />

          {/* Trending Products */}
          <ProductList title={t("trending_products")} type="trending" />

          <div className="content_spacing" />

          {/* Collections */}
          <Collection
            data={data.additional && data.additional.homePage.collection}
          />

          {/* Best Selling Products */}
          <ProductList title={t("best_selling")} type="bestselling" />

          <BrandCardList items={data.brand || []} />

          <div className="content_spacing" />
        </>
      )}

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
