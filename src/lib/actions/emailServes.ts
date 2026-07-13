"use server";

import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: "ebmo3112002@gmail.com",
    pass: "eucw nuxf ekdv johc",
  },
});

export async function sendEmail({
  to,
  subject,
  body,
  pdfBuffer,
  pdfFilename,
}: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `Etala - Elmanara Developments <${"ebmo3112002@gmail.com"}>`,
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
    });

    console.log("📤 Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}