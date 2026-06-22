import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { StatsMembersResponse } from "@repo/schemas/stats";

export const alt = "Sócio-Torcedor Tubarão";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let total = 0;
  
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/stats/members`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data: StatsMembersResponse = await res.json();
      total = data.total;
    }
  } catch (e) {
    console.error("Failed to fetch stats for OG image", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage: "linear-gradient(to bottom right, #000000, #111827)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.05)",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "24px",
            padding: "40px 80px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 700, marginBottom: 20, color: "#9ca3af" }}>
            SÓCIOS ATIVOS
          </div>
          <div
            style={{
              fontSize: 160,
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 40,
              color: "#3b82f6", // tailwind blue-500 equivalent, replace with brand primary if needed
              textShadow: "0 0 40px rgba(59, 130, 246, 0.5)",
            }}
          >
            {total}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: "#d1d5db" }}>
            Clube Atlético Tubarão
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
