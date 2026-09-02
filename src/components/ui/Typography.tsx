import React from "react";
import { cn } from "@/lib/utils";

export type TypographyVariant =
  | "headline-large"
  | "headline-medium"
  | "headline-small"
  | "title-large"
  | "title-medium"
  | "title-small"
  | "body-large"
  | "body-medium"
  | "body-small"
  | "label-large"
  | "label-medium"
  | "label-small";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  htmlFor?: string;
  children: React.ReactNode;
}

const defaultTagMap: Record<TypographyVariant, React.ElementType> = {
  "headline-large": "h1",
  "headline-medium": "h2",
  "headline-small": "h3",
  "title-large": "h2",
  "title-medium": "h3",
  "title-small": "h4",
  "body-large": "p",
  "body-medium": "p",
  "body-small": "p",
  "label-large": "span",
  "label-medium": "span",
  "label-small": "span",
};

const variantStyles: Record<TypographyVariant, string> = {
  // Heading variants (configured with Anton display font)
  "headline-large": "font-anton text-3xl tracking-wide text-on-surface",
  "headline-medium": "font-anton text-2xl tracking-wide text-on-surface",
  "headline-small": "font-anton text-xl tracking-wide text-on-surface",

  // Title variants (configured with Bebas Neue display font)
  "title-large": "font-bebas text-2xl tracking-wide text-on-surface",
  "title-medium": "font-bebas text-xl tracking-wide text-on-surface",
  "title-small": "font-bebas text-lg tracking-wide text-on-surface",

  // Body variants (standard clean sans font)
  "body-large": "text-base font-normal text-on-surface",
  "body-medium": "text-sm font-normal text-on-surface-variant",
  "body-small": "text-xs font-normal text-on-surface-variant",

  // Label variants
  "label-large": "text-base font-semibold text-on-surface",
  "label-medium": "text-sm font-medium text-on-surface",
  "label-small": "text-xs font-semibold text-on-surface-variant",
};

/**
 * Material Design 3 Typography component for standardized heading, title,
 * body, and label variants.
 * - Headings use Anton display font.
 * - Titles use Bebas Neue display font.
 * - Label Medium is 14px (text-sm) with font-weight 500 (font-medium).
 */
export function Typography({
  variant = "body-medium",
  as,
  children,
  className,
  ...props
}: TypographyProps) {
  const Component = as || defaultTagMap[variant] || "span";

  return (
    <Component
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
