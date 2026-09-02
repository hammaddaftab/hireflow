"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { ROUTES, ROUTE_LABEL_MAP } from "@/config/navigation";

export function Navbar() {
  const pathname = usePathname() || "/";

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (pathname === "/") {
      return [{ label: "Dashboard" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: "Dashboard", href: ROUTES.DASHBOARD }];

    let currentPath = "";
    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const label = ROUTE_LABEL_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);

      items.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 shadow-xs">
      <div className="flex items-center space-x-5">
        <Link href={ROUTES.DASHBOARD} className="text-xl font-bold tracking-tight text-on-surface hover:text-primary transition-colors">
          HireFlow
        </Link>
        <div className="h-4 w-px bg-outline-variant" aria-hidden="true" />
        <Breadcrumbs items={breadcrumbItems} className="mb-0" />
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />
        <Link href={ROUTES.NEW_JOB}>
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
            Create Job Posting
          </Button>
        </Link>
      </div>
    </header>
  );
}
