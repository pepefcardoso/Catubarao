import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SentryProvider } from "@/components/sentry-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SentryProvider />
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
