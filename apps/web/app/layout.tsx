
import type { Metadata } from "next";
import { SentryProvider } from "@/components/sentry-provider";

export const metadata: Metadata = {
  title: "Clube Atlético Tubarão",
  description: "Clube Atlético Tubarão SAF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SentryProvider />
        {children}
      </body>
    </html>
  );
}
