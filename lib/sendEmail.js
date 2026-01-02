import nodemailer from "nodemailer";

export default async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}) {
  try {
    const smtpTransport = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_SERVER,
      port: Number(process.env.EMAIL_SMTP_PORT),
      secure: process.env.EMAIL_SECURITY === "true", // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_SMTP_USERNAME,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await smtpTransport.sendMail({
      from: process.env.EMAIL_FROM_ADDRESS,
      to,
      subject,
      text,       // optional
      html,       // optional
      attachments // optional
    });

    return { success: true };
  } catch (err) {
    console.error("❌ Email send error:", err);
    return { success: false };
  }
}
