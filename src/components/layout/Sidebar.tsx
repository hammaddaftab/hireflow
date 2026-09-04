"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Inbox, 
  FilePlus, 
  PanelLeftClose, 
  PanelLeftOpen,
  Info
} from "lucide-react";
import { SIDEBAR_NAV_ITEMS, isNavItemActive } from "@/config/navigation";
import { Tooltip } from "@/components/ui/Tooltip";

export interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activePathname = usePathname() || currentPath || "/";

  const getNavIcon = (id: string) => {
    switch (id) {
      case "dashboard":
        return <LayoutDashboard className="h-4 w-4 shrink-0" />;
      case "review-queue":
        return <Inbox className="h-4 w-4 shrink-0" />;
      case "create-requirement":
      default:
        return <FilePlus className="h-4 w-4 shrink-0" />;
    }
  };

  return (
    <aside
      className={`border-r border-outline-variant bg-surface-container-low min-h-[calc(100vh-4rem)] flex flex-col justify-between transition-all duration-200 ease-in-out ${
        isCollapsed ? "w-16 p-2" : "w-64 p-4"
      }`}
    >
      <div>
        {/* Sidebar Header & Collapse Toggle */}
        <div className={`flex items-center pb-3 mb-2 border-b border-outline-variant/60 ${
          isCollapsed ? "justify-center" : "justify-between px-1"
        }`}>
          {!isCollapsed && (
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Navigation
            </span>
          )}
          <Tooltip
            content={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            side="right"
          >
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 rounded-md border border-outline-variant bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" />
              )}
            </button>
          </Tooltip>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item, activePathname);
            const icon = getNavIcon(item.id);

            if (isCollapsed) {
              return (
                <Tooltip
                  key={item.href}
                  content={
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-on-surface">{item.label}</div>
                      {item.description && (
                        <div className="text-[11px] text-on-surface-variant">{item.description}</div>
                      )}
                    </div>
                  }
                  side="right"
                >
                  <Link
                    href={item.href}
                    className={`h-10 w-10 mx-auto flex items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary-container text-on-primary-container shadow-xs font-semibold"
                        : "text-on-surface hover:bg-surface-container hover:text-on-surface"
                    }`}
                    aria-label={item.label}
                  >
                    {icon}
                  </Link>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary-container border-l-2 border-primary font-semibold shadow-xs"
                    : "text-on-surface hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {icon}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Recruiter Transparency Card */}
      {isCollapsed ? (
        <div className="flex justify-center pt-2">
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs">
                <div className="font-semibold text-on-surface">Recruiter Transparency</div>
                <div className="text-[11px] text-on-surface-variant">
                  HireFlow enforces hard dealbreakers deterministically before running weighted scoring on preferred skills.
                </div>
              </div>
            }
            side="right"
          >
            <div className="h-8 w-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant cursor-help">
              <Info className="h-4 w-4" />
            </div>
          </Tooltip>
        </div>
      ) : (
        <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant text-xs text-on-surface-variant">
          <div className="font-semibold text-on-surface mb-1">Recruiter Transparency</div>
          <p className="leading-relaxed text-[11px] text-on-surface-variant">
            HireFlow enforces hard dealbreakers deterministically before running weighted scoring on preferred skills.
          </p>
        </div>
      )}
    </aside>
  );
}
