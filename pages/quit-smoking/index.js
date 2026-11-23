
import Head from "next/head";
import Link from "next/link";

export default function QuitSmokingPage() {
  return (
    <>
      <Head>
        <title>Quit Smoking Support | Brisbane Surgical Supplies</title>
        <meta
          name="description"
          content="Explore smoking cessation information and support resources to help you take your next step towards a smoke-free life."
        />
      </Head>

      <main
        style={{
          background: "#f5faf8",
          padding: "65px 20px",
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
            <span style={{ color: "#888" }}> / Quit Smoking</span>
          </div>

          {/* Main heading */}
          <section
            style={{
              padding: "55px 35px",
              borderRadius: "18px",
              background:
                "linear-gradient(120deg,#e4f6ed,#edf5ff)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "42px" }}>🌿</div>

            <h1
              style={{
                color: "#193d38",
                fontSize: "38px",
                fontWeight: "800",
                margin: "15px 0",
              }}
            >
              Get Started with Quit Smoking Support
            </h1>

            <p
              style={{
                maxWidth: "720px",
                margin: "0 auto",
                color: "#667b77",
                fontSize: "16px",
                lineHeight: "1.9",
              }}
            >
              Finding the right support can help you take
              your next step towards a smoke-free life.
              Explore trusted information and support
              resources to help you along the way.
            </p>
          </section>

          {/* Support section */}
          <section
            style={{
              marginTop: "45px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "35px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              style={{
                color: "#193d38",
                fontSize: "27px",
                fontWeight: "800",
                marginBottom: "15px",
              }}
            >
              Find the Support You Need
            </h2>

            <p
              style={{
                color: "#667b77",
                fontSize: "15px",
                lineHeight: "1.9",
              }}
            >
              Quitting smoking can be challenging, but
              support is available. Speak with your GP
              or pharmacist about suitable options and
              access professional counselling to help
              you build a quit plan.
            </p>
          </section>

          {/* Quitline consultation */}
          <section
            style={{
              marginTop: "30px",
              padding: "40px 30px",
              background: "#ffffff",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #e2eee8",
            }}
          >
            <div style={{ fontSize: "42px" }}>☎</div>

            <h2
              style={{
                color: "#193d38",
                fontSize: "27px",
                fontWeight: "800",
                margin: "15px 0",
              }}
            >
              Speak with Quitline
            </h2>

            <p
              style={{
                color: "#667b77",
                maxWidth: "650px",
                margin: "0 auto 25px",
                fontSize: "15px",
                lineHeight: "1.8",
              }}
            >
              Quitline provides free and confidential
              counselling to help people develop a
              personalised plan to quit smoking or vaping.
            </p>

            <a
              href="tel:137848"
              style={{
                display: "inline-block",
                padding: "14px 30px",
                borderRadius: "7px",
                background: "#15976c",
                color: "#ffffff",
                fontWeight: "700",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Call Quitline: 13 7848
            </a>

            <div style={{ marginTop: "18px" }}>
              <a
                href="https://www.quit.org.au/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#15976c",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Visit Official Quit Website →
              </a>
            </div>
          </section>

          {/* Healthcare advice */}
          <section
            style={{
              marginTop: "30px",
              padding: "30px",
              background: "#eaf5f0",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                color: "#193d38",
                fontSize: "21px",
                marginBottom: "12px",
              }}
            >
              Professional Healthcare Advice
            </h3>

            <p
              style={{
                color: "#55736a",
                fontSize: "14px",
                lineHeight: "1.8",
                margin: 0,
              }}
            >
              Speak with a qualified healthcare professional
              about smoking cessation methods, nicotine
              replacement options and medicines that may
              be appropriate for your individual needs.
            </p>
          </section>

          {/* Disclaimer */}
          <p
            style={{
              marginTop: "30px",
              color: "#84928d",
              fontSize: "12px",
              lineHeight: "1.7",
              textAlign: "center",
            }}
          >
            Brisbane Surgical Supplies provides this page
            for general informational purposes. It does not
            provide medical diagnosis, prescriptions or
            individual treatment advice.
          </p>
        </div>
      </main>
    </>
  );
}
