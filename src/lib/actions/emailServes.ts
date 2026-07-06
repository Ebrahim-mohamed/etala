// sendEmail.ts
"use server";

import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

const EMAIL_USER = "view@etala.net";
const EMAIL_PASSWORD = "Et@l@!23!";

export async function sendEmail({
  to,
  subject,
  body,
  pdfBuffer,
  pdfFilename,
}: SendEmailOptions) {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // Must be false for STARTTLS
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
    tls: {
      ciphers: "TLSv1.2",
      rejectUnauthorized: false, // Optional, helps with some TLS handshake issues
    },
  });

  const mailOptions = {
    from: `Etala - Elmanara Developments <${EMAIL_USER}>`,
    to,
    subject,
    text: body,
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📤 Email sent:", info.response);
    return { success: true };
  } catch (err) {
    console.error("❌ Error sending email:", err);
    return { success: false, error: "Failed to send email" };
  }
}