import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BreakingTicker } from "@/components/ui/BreakingTicker";
import { BackToTop } from "@/components/ui/BackToTop";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <BreakingTicker />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
      <BackToTop />
    </div>
  );
}