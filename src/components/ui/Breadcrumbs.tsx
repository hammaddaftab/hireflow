import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

/**
 * Accessible Breadcrumbs navigation component.
 * Adheres to WAI-ARIA breadcrumb pattern using <nav>, <ol>, <li> and aria-current="page".
 */
export function Breadcrumbs({
  items,
  separator = "/",
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={twMerge(clsx("flex items-center text-xs font-semibold mb-1.5", className))}
      {...props}
    >
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-on-surface-variant hover:text-primary hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "text-on-surface font-bold" : "text-on-surface-variant"}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span
                  aria-hidden="true"
                  className="text-on-surface-variant/40 select-none font-normal"
                >
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
