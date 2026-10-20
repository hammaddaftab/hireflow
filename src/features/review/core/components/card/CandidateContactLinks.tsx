"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";

export interface CandidateContactLinksProps {
  email?: string | null;
  phone?: string | null;
  className?: string;
  size?: "sm" | "md";
}

// Builds web compose URL directly targeting Google Mail
export function formatGoogleMailUrl(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.trim())}`;
}

// Builds international click-to-chat URL for WhatsApp
export function formatWhatsAppUrl(phone: string): string {
  let digits = phone.trim().replace(/\D/g, "");
  // Normalize Pakistani local mobile numbers starting with 0 (e.g. 0300xxxxxxx) to 92 country code
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `92${digits.slice(1)}`;
  }
  return `https://wa.me/${digits}`;
}

// Two separate clickable components conditionally rendered for candidate contact methods
export function CandidateContactLinks({
  email,
  phone,
  className = "",
  size = "md",
}: CandidateContactLinksProps) {
  const hasEmail = Boolean(email && email.trim());
  const hasPhone = Boolean(phone && phone.trim());

  if (!hasEmail && !hasPhone) {
    return null;
  }

  const isSmall = size === "sm";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {hasEmail && email && (
        <a
          href={formatGoogleMailUrl(email)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1.5 rounded-lg font-medium bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary border border-outline-variant/40 transition-colors shadow-xs ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
          title="Send email via Google Mail"
        >
          <Mail className={`${isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} text-primary shrink-0`} />
          <span className="truncate max-w-[200px]">{email}</span>
        </a>
      )}

      {hasPhone && phone && (
        <a
          href={formatWhatsAppUrl(phone)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1.5 rounded-lg font-medium bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-emerald-600 transition-colors border border-outline-variant/40 shadow-xs ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
          title="Chat on WhatsApp"
        >
          <Phone className={`${isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} text-emerald-600 shrink-0`} />
          <span className="truncate max-w-[160px]">{phone}</span>
        </a>
      )}
    </div>
  );
}
