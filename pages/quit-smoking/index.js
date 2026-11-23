
import Head from "next/head";
import Link from "next/link";
import QuitSmokingInquiryForm from "~/components/QuitSmokingInquiryForm";

// Replace these with your actual authorised service URLs.
const BOOKING_URL = "/consultation-booking";
const PRESCRIPTION_UPLOAD_URL = "/prescription-upload";

export default function QuitSmokingPage() {
  const services = [
    {
      icon: "📅",
      title: "Book a $20 Consultation",
      description:
        "Book a consultation with our healthcare provider to discuss your individual needs and available smoking cessation options.",
      button: "Book Now",
      link: BOOKING_URL,
      color: "#e8f7ef",
    },
    {
      icon: "📄",
      title: "Upload Your Prescription",
      description:
        "Already have a valid prescription? Use our authorised prescription submission process.",
      button: "Upload Prescription",
      link: PRESCRIPTION_UPLOAD_URL,
      color: "#eaf3ff",
    },
  ];

  return (
    <>
      <Head>
        <title>
          Quit Smoking | Brisbane Surgical Supplies
        </title>

        <meta
          name="description"
          content="Explore smoking cessation consultation and prescription submission information at Brisbane Surgical Supplies."
        />
      </Head>

      <main
        style={{
          background: "#f5faf8",
          padding: "55px 20px",
          minHeight: "70vh",
        }}
      >
        <div
          style={{
            maxWidth: "1150px",
            margin: "0 auto",
          }}
        >
          {/* Breadcrumb */}
          <div style={{ marginBottom: "25px", fontSize: "14px" }}>
            <Link href="/" style={{ color: "#15976c" }}>
              Home
            </Link>
            <span style={{ color: "#888" }}>
              {" / Quit Smoking"}
            </span>
          </div>

          {/* Hero Section */}
          <section
            style={{
              padding: "65px 30px",
              borderRadius: "18px",
              background:
                "linear-gradient(120deg,#e4f6ed,#edf5ff)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "45px" }}>🌿</div>

            <h1
              style={{
                color: "#193d38",
                fontSize: "40px",
                fontWeight: "800",
                margin: "15px 0",
              }}
            >
              Get Started with a Quit Smoking Consultation
            </h1>

            <p
              style={{
                maxWidth: "750px",
                margin: "0 auto",
                color: "#667b77",
                fontSize: "16px",
                lineHeight: "1.9",
              }}
            >
              Find the support you need to take your next
              step towards quitting smoking. Explore
              consultation options and prescription
              submission information through our service.
            </p>
          </section>

          {/* Two Main Service Cards */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "25px",
              marginTop: "45px",
            }}
          >
            {services.map((service, index) => (
              <div
                key={index}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4eee9",
                  borderRadius: "18px",
                  padding: "35px 30px",
                  textAlign: "center",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    width: "75px",
                    height: "75px",
                    borderRadius: "20px",
                    background: service.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "35px",
                    margin: "0 auto 25px",
                  }}
                >
                  {service.icon}
                </div>

                <h2
                  style={{
                    color: "#193d38",
                    fontSize: "23px",
                    fontWeight: "800",
                    marginBottom: "15px",
                  }}
                >
                  {service.title}
                </h2>

                <p
                  style={{
                    color: "#71817d",
                    fontSize: "14px",
                    lineHeight: "1.9",
                    minHeight: "80px",
                  }}
                >
                  {service.description}
                </p>

                <Link
                  href={service.link}
                  style={{
                    display: "inline-block",
                    marginTop: "20px",
                    padding: "14px 25px",
                    borderRadius: "7px",
                    background: "#15976c",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  {service.button} →
                </Link>
              </div>
            ))}
          </section>

          {/* Information Section */}
          <section
            style={{
              marginTop: "45px",
              padding: "35px",
              background: "#ffffff",
              borderRadius: "16px",
            }}
          >
            <h2
              style={{
                color: "#193d38",
                fontSize: "26px",
                fontWeight: "800",
                marginBottom: "15px",
              }}
            >
              How It Works
            </h2>

            <p
              style={{
                color: "#667b77",
                fontSize: "15px",
                lineHeight: "1.9",
              }}
            >
              Choose the appropriate service above to
              proceed with your consultation booking or
              prescription submission. A qualified
              healthcare professional can assess your
              individual circumstances and discuss
              appropriate options.
            </p>
          </section>

          {/* Existing Email Enquiry Form */}
          <QuitSmokingInquiryForm />

          {/* Disclaimer */}
          <p
            style={{
              marginTop: "25px",
              color: "#84928d",
              fontSize: "12px",
              lineHeight: "1.7",
              textAlign: "center",
            }}
          >
            Healthcare services and prescription processing
            are subject to applicable Australian regulatory
            requirements and professional assessment.
          </p>
        </div>
      </main>
    </>
  );
}
