import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Seja Sócio-Torcedor | Clube Atlético Tubarão",
    description: "Faça seu cadastro e torne-se um Sócio-Torcedor do Clube Atlético Tubarão.",
  };
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
