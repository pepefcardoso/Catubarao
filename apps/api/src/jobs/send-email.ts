import { Job } from "bullmq";
import { sendEmail } from "../lib/email";
import * as React from "react";
import { WelcomeEmail } from "../emails/WelcomeEmail";
import { PaymentConfirmedEmail } from "../emails/PaymentConfirmedEmail";
import { DelinquencyD1Email } from "../emails/DelinquencyD1Email";
import { DelinquencyD7Email } from "../emails/DelinquencyD7Email";
import { DelinquencyD15Email } from "../emails/DelinquencyD15Email";
import { SuspensionEmail } from "../emails/SuspensionEmail";
import { ReactivationEmail } from "../emails/ReactivationEmail";
import { PollOpenEmail } from "../emails/PollOpenEmail";
import { DealExpirationEmail } from "../emails/DealExpirationEmail";

const templates: Record<string, React.FC<any>> = {
  DealExpirationEmail,
  WelcomeEmail,
  PaymentConfirmedEmail,
  DelinquencyD1Email,
  DelinquencyD7Email,
  DelinquencyD15Email,
  SuspensionEmail,
  ReactivationEmail,
  PollOpenEmail,
};

export interface SendEmailJobData {
  template: string;
  to: string;
  subject: string;
  props: Record<string, any>;
}

export async function sendEmailJob(job: Job<SendEmailJobData>) {
  const { template, to, subject, props } = job.data;

  const TemplateComponent = templates[template];
  if (!TemplateComponent) {
    throw new Error(`Email template ${template} not found`);
  }

  const element = React.createElement(TemplateComponent, props);
  await sendEmail(element, to, subject);
}
