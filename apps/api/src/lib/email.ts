import { Resend } from "resend";
import { env } from "./env";
import * as React from "react";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(
  template: React.ReactElement,
  to: string,
  subject: string
) {
  try {
    const data = await resend.emails.send({
      from: env.RESEND_FROM,
      to,
      subject,
      react: template,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
