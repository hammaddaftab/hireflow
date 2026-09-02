"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_ITEMS, isNavItemActive } from "@/config/navigation";

export interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const activePathname = usePathname() || currentPath || "/";

  return (
    <aside className="w-64 border-r border-outline-variant bg-surface-container-low min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Navigation
        </div>
        <nav className="space-y-1 mt-1">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item, activePathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary-container border-l-2 border-primary font-semibold shadow-xs"
                    : "text-on-surface hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant text-xs text-on-surface-variant">
        <div className="font-semibold text-on-surface mb-1">Recruiter Transparency</div>
        <p className="leading-relaxed text-on-surface-variant">
          HireFlow enforces hard dealbreakers deterministically before running weighted scoring on preferred skills.
        </p>
      </div>
    </aside>
  );
}
