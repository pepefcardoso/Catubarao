import { Job } from "bullmq";
import { sendEmail } from "../lib/email";
import * as React from "react";
import { WelcomeEmail } from "../emails/WelcomeEmail";

const templates: Record<string, React.FC<any>> = {
  WelcomeEmail,
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
