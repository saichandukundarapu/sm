
import { useState } from "react";

export default function QuitSmokingInquiryForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/quit-smoking-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Submission failed");
      }

      setStatus(result.message);

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setStatus(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    border: "1px solid #dce8e2",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  };

  return (
    <section
      style={{
        maxWidth: "750px",
        margin: "45px auto",
        padding: "35px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0,0,0,.05)",
      }}
    >
      <h2 style={{ color: "#193d38", fontSize: "28px" }}>
        Send Us an Enquiry
      </h2>

      <p style={{ color: "#71817d", lineHeight: "1.7" }}>
        Have a question? Send our team an enquiry.
      </p>

      <form onSubmit={handleSubmit}>
        {[
          { name: "name", label: "Full Name", type: "text" },
          { name: "email", label: "Email Address", type: "email" },
          { name: "phone", label: "Phone Number", type: "tel" },
        ].map((field) => (
          <div key={field.name} style={{ marginTop: "18px" }}>
            <label>{field.label}</label>
            <input
              style={inputStyle}
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              maxLength={
                field.name === "name" ? 100 :
                field.name === "email" ? 254 : 30
              }
              required
            />
          </div>
        ))}

        <div style={{ marginTop: "18px" }}>
          <label>Your Enquiry</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: "120px",
              resize: "vertical",
            }}
            name="message"
            value={form.message}
            onChange={handleChange}
            maxLength={3000}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "22px",
            padding: "15px",
            border: "none",
            borderRadius: "8px",
            background: "#15976c",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Enquiry"}
        </button>

        {status && (
          <p role="status" style={{ marginTop: "15px" }}>
            {status}
          </p>
        )}
      </form>

      <p style={{ fontSize: "12px", color: "#89958f" }}>
        Please do not submit sensitive medical information through
        this general enquiry form.
      </p>
    </section>
  );
}
