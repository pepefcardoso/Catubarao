import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { WelcomeClient } from "./welcome-client";
import { env } from "@/lib/env";

export const metadata = {
  title: "Bem-vindo | Sócio-Torcedor",
  description: "Bem-vindo à família Tubarão.",
};

export default async function WelcomePage() {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  // Fetch from the API to get me data
  // Server-side fetch needs absolute URL and cookie forwarding
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/members/me`, {
    headers: { cookie },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      redirect("/login");
    }
    // Handle error or just redirect to dashboard
    redirect("/dashboard");
  }

  const member = await res.json();

  return (
    <div className="py-8 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      <WelcomeClient member={member} />
    </div>
  );
}
