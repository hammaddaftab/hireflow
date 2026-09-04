import React from "react";
import type { Metadata } from "next";
import { Anton, Bebas_Neue } from "next/font/google";
import "@/app/globals.css";
import { AppLayoutShell } from "@/components/layout/AppLayoutShell";
import { StoreProvider } from "@/lib/redux/StoreProvider";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HireFlow - Transparent Recruiter Screening Engine",
  description: "Descriptive hiring assistant with configurable hard knockout filters and soft criteria scoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full bg-surface text-on-surface ${anton.variable} ${bebas.variable}`}>
      <body className="h-full bg-surface text-on-surface">
        <StoreProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </StoreProvider>
      </body>
    </html>
  );
}
