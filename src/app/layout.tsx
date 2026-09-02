import React from "react";
import type { Metadata } from "next";
import { Anton, Bebas_Neue } from "next/font/google";
import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
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
      <body className="flex min-h-full flex-col font-sans antialiased bg-surface text-on-surface">
        <StoreProvider>
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 bg-surface p-8">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
