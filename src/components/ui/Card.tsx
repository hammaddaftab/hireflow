import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
}

export function Card({
  children,
  className,
  title,
  description,
  headerAction,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant shadow-surface p-6 overflow-hidden transition-colors",
          className
        )
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="mb-4 pb-3 border-b border-outline-variant flex items-start justify-between">
          <div>
            {title && <h3 className="text-base font-bold text-on-surface tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-on-surface-variant mt-0.5 font-medium">{description}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
