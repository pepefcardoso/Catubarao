import { Body, Container, Head, Html, Preview, Section, Tailwind } from "@react-email/components";
import * as React from "react";
import { ClubHeader } from "./ClubHeader";
import { EmailFooter } from "./EmailFooter";

interface EmailLayoutProps {
  previewText?: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ previewText = "", children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800 m-0 p-0">
          <Container className="mx-auto my-0 p-0 w-full max-w-[600px] bg-white overflow-hidden sm:rounded-md sm:my-8 shadow-sm">
            <ClubHeader />
            <Section className="px-4 py-6 sm:px-8 sm:py-8">
              {children}
            </Section>
            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailLayout;
