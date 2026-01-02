import nodemailer from "nodemailer";

/**
 * Send email with optional HTML and attachments (PDF supported)
 *
 * @param {Object} options
 * @param {string|string[]} options.to
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {Array}  [options.attachments]
 */
export default async function sendEmail({
  to,
  subject,
  text = "",
  html = "",
  attachments = [],
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_SERVER,
      port: Number(process.env.EMAIL_SMTP_PORT),
      secure: process.env.EMAIL_SECURITY === "true", // true = 465, false = 587
      auth: {
        user: process.env.EMAIL_SMTP_USERNAME,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // 🔥 important for some SMTP providers
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM_ADDRESS,
      to,
      subject,
      text: text || undefined, // avoid empty text warnings
      html: html || undefined,
      attachments: attachments.length ? attachments : undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, error };
  }
}
