import * as React from "react";
import { StoreHeader } from "../../components/layout/store-header";
import { StoreFooter } from "../../components/layout/store-footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <StoreHeader />
      <main className="flex-grow pt-[104px] md:pt-[156px] pb-16">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}
