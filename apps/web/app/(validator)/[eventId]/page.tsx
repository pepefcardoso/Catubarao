"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const Scanner = dynamic(() => import("./scanner"), {
  ssr: false,
});

export default function ValidatorPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  
  return <Scanner eventId={eventId} />;
}
