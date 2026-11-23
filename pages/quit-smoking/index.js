
import Head from "next/head";
import Link from "next/link";

export default function QuitSmokingPage() {
  const sections = [
    {
      icon: "✚",
      title: "Nicotine Replacement Therapy",
      description:
        "Learn about nicotine replacement options, including patches, gum and lozenges, and how they may support your quit journey.",
    },
    {
      icon: "🌿",
      title: "Smoking Cessation Support",
      description:
        "Discover helpful information, practical tips and resources to help you take steps towards a smoke-free lifestyle.",
    },
    {
      icon: "♡",
      title: "Professional Guidance",
      description:
        "Speak with a qualified healthcare professional about suitable smoking cessation options and support.",
    },
  ];

  return (
    <>
      <Head>
        <title>Quit Smoking | Brisbane Surgical Supplies</title>
        <meta
          name="description"
          content="Explore smoking cessation information, nicotine replacement therapy and professional guidance."
        />
      </Head>

      <main style={{
        background: "linear-gradient(135deg,#f0faf6,#f5faff)",
        padding: "65px 20px",
        minHeight: "70vh"
      }}>
        <div style={{
          maxWidth: "1150px",
          margin: "auto"
        }}>
          <div style={{
            textAlign: "center",
            maxWidth: "750px",
            margin: "0 auto 45px"
          }}>
            <span style={{
              color: "#15976c",
              fontWeight: "700",
              letterSpacing: "2px",
              fontSize: "12px"
            }}>
              HEALTHIER CHOICES
            </span>

            <h1 style={{
              color: "#193d38",
              fontSize: "42px",
              fontWeight: "800",
              margin: "15px 0"
            }}>
              Quit Smoking
            </h1>

            <p style={{
              color: "#667b77",
              fontSize: "16px",
              lineHeight: "1.8"
            }}>
              Your journey to becoming smoke-free starts with
              finding the right support. Explore information
              and resources to help you take the next step.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "25px"
          }}>
            {sections.map((item, index) => (
              <div key={index} style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "16px",
                border: "1px solid #e4eee9",
                boxShadow: "0 8px 25px rgba(30,70,55,.06)"
              }}>
                <div style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "15px",
                  background: "#e8f7ef",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "27px",
                  color: "#15976c",
                  marginBottom: "22px"
                }}>
                  {item.icon}
                </div>

                <h2 style={{
                  fontSize: "21px",
                  color: "#193d38",
                  marginBottom: "15px"
                }}>
                  {item.title}
                </h2>

                <p style={{
                  color: "#71817d",
                  fontSize: "14px",
                  lineHeight: "1.8"
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: "center",
            marginTop: "45px",
            color: "#55736a"
          }}>
            <p>
              For personalised advice, consult a qualified
              healthcare professional.
            </p>

            <Link href="/" style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "13px 25px",
              background: "#15976c",
              color: "#fff",
              borderRadius: "7px",
              textDecoration: "none",
              fontWeight: "700"
            }}>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
