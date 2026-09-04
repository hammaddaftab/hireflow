"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export interface AppLayoutShellProps {
  children: React.ReactNode;
}

export function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();
  const isFocusMode = pathname?.startsWith("/review/focus");

  // In Focus Mode, render children as a completely independent standalone screen
  // without the application Navbar, Sidebar, or container padding.
  if (isFocusMode) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background text-on-surface">
        {children}
      </div>
    );
  }

  // Standard Application Two-Tier Dashboard Shell
  return (
    <div className="flex min-h-full flex-col font-sans antialiased bg-surface text-on-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-surface p-8">{children}</main>
      </div>
    </div>
  );
}
