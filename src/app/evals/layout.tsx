export const dynamic = "force-dynamic";

import React from "react";
import { notFound } from "next/navigation";
import { FEATURES } from "@/config/features";
import { EvalsNavbar } from "@/features/evals/components/EvalsNavbar";

export default function EvalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Feature gating guard
  if (!FEATURES.AI_EVALS) {
    notFound();
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-16 space-y-6">
      <EvalsNavbar />
      {children}
    </div>
  );
}
