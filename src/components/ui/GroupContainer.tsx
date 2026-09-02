import React from "react";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

export interface GroupContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
  index?: number;
}

/**
 * Singleton group container wrapping related field sections with centralized
 * padding, background elevation, and Material Design 3 header typography.
 * When index === 0, top padding is omitted (pt-0 pb-6).
 */
export function GroupContainer({
  title,
  description,
  children,
  index,
  className,
  ...props
}: GroupContainerProps) {
  return (
    <div
      className={cn(
        "space-y-2",
        index === 0 ? "pt-0 pb-6" : "py-6",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div>
          {title && (
            /* Level 3: Group Title */
            <Typography variant="title-large" as="h3" className="text-on-surface">
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body-small" className="text-on-surface-variant font-normal leading-none">
              {description}
            </Typography>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
