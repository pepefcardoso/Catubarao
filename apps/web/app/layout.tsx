import type { Metadata } from "next";

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
        {children}
      </body>
    </html>
  );
}
