"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface OverlayContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function OverlayContainer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: OverlayContainerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* M3 Scrim Backdrop */}
      <div
        className="fixed inset-0 bg-scrim transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* M3 Surface Container High Overlay Card */}
      <div
        className={twMerge(
          clsx(
            "relative z-10 w-full max-h-[90vh] flex flex-col rounded-xl border border-outline-variant bg-surface-container-high text-on-surface shadow-overlay p-6 transition-all duration-200 animate-in zoom-in-95",
            sizeClasses[size],
            className
          )
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-outline-variant pb-4 mb-4 shrink-0">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-on-surface tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-on-surface-variant mt-1 font-medium">
                  {description}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close overlay container"
              icon={<X className="h-4 w-4" />}
            />
          </div>
        )}

        {/* Body Content - Scrollable */}
        <div className="text-sm text-on-surface leading-relaxed overflow-y-auto pr-1 flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 border-t border-outline-variant pt-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
