
import Link from "next/link";

const sections = [
  {
    icon: "✚",
    title: "Nicotine Replacement Therapy",
    description:
      "Learn about nicotine replacement options, including patches, gum and lozenges, and how they may support your quit journey.",
    button: "Explore NRT",
    link: "/quit-smoking",
    color: "#e8f7ef",
  },
  {
    icon: "🌿",
    title: "Smoking Cessation Support",
    description:
      "Discover helpful information, practical tips and resources to help you take steps towards a smoke-free lifestyle.",
    button: "Learn More",
    link: "/quit-smoking",
    color: "#edf6e8",
  },
  {
    icon: "♡",
    title: "Professional Guidance",
    description:
      "Find out how qualified healthcare professionals can help you explore suitable smoking cessation options.",
    button: "Get Guidance",
    link: "/quit-smoking",
    color: "#eaf3ff",
  },
];

export default function QuitSmokingSection() {
  return (
    <section
      style={{
        width: "100%",
        padding: "75px 20px",
        background:
          "radial-gradient(circle at 5% 10%, #e1f6ef, transparent 35%), radial-gradient(circle at 95% 90%, #dceeff, transparent 35%), linear-gradient(120deg, #ffffff, #f4fbfa)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Heading */}
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto 45px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "#15976c",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "2px",
            }}
          >
            HEALTHIER CHOICES
          </span>

          <h2
            style={{
              margin: "12px 0 16px",
              color: "#193d38",
              fontSize: "40px",
              fontWeight: "800",
            }}
          >
            Quit Smoking
          </h2>

          <p
            style={{
              color: "#667b77",
              fontSize: "16px",
              lineHeight: "1.8",
              margin: 0,
            }}
          >
            Your journey towards a smoke-free life starts with
            the right information and support. Explore resources
            to help you take the next step.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {sections.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "30px",
                minHeight: "290px",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "1px solid #e5efeb",
                borderRadius: "18px",
                boxShadow: "0 10px 35px rgba(35,75,65,0.06)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "28px",
                }}
              >
                <span
                  style={{
                    color: "#a1b7ae",
                    fontSize: "13px",
                    fontWeight: "800",
                  }}
                >
                  0{index + 1}
                </span>

                <span
                  style={{
                    width: "55px",
                    height: "55px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "16px",
                    background: item.color,
                    fontSize: "27px",
                    color: "#15976c",
                  }}
                >
                  {item.icon}
                </span>
              </div>

              <h3
                style={{
                  color: "#193d38",
                  fontSize: "21px",
                  fontWeight: "750",
                  lineHeight: "1.4",
                  margin: "0 0 14px",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: "#71817d",
                  fontSize: "14px",
                  lineHeight: "1.8",
                  margin: "0 0 25px",
                }}
              >
                {item.description}
              </p>

              <Link
                href={item.link}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "fit-content",
                  marginTop: "auto",
                  padding: "12px 19px",
                  borderRadius: "7px",
                  background: "#15976c",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                {item.button} →
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "35px",
            color: "#55736a",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          <span>🌱</span>
          Small steps today can support a healthier tomorrow.
        </div>
      </div>
    </section>
  );
}
