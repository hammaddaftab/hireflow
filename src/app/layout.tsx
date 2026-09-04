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
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full bg-surface text-on-surface ${anton.variable} ${bebas.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('hireflow-theme');
                  var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="h-full bg-surface text-on-surface">
        <StoreProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </StoreProvider>
      </body>
    </html>
  );
}
