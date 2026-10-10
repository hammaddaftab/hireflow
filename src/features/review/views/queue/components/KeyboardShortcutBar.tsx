"use client";

import React, { useEffect } from "react";
import { Keyboard, Bookmark, Check, X, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface KeyboardShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutModal({ isOpen, onClose }: KeyboardShortcutModalProps) {
  // Listen for Escape key to dismiss dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-surface border border-outline-variant/60 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-on-surface-variant">Fast review controls for keyboard triage</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-xl text-on-surface-variant hover:text-on-surface cursor-pointer"
            aria-label="Close shortcuts dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
              Decision Actions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Keep Candidate
                </span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">A</kbd>
                  <span className="text-on-surface-variant text-[11px]">/</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">Space</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Flag Candidate
                </span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">F</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Pass Candidate
                </span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">R</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-on-surface-variant" /> Undo Decision
                </span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">Z</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface">Clear Current Decision</span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">U</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface">Next Undecided</span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">N</kbd>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
              Navigation & Evidence
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-on-surface-variant" /> Toggle Evidence
                </span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">E</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface">Previous / Next</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">←</kbd>
                  <kbd className="px-1.5 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">→</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface">Toggle Shortcuts</span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">?</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                <span className="font-medium text-on-surface">Dismiss Dialog</span>
                <kbd className="px-2 py-0.5 rounded-md bg-surface font-mono text-[11px] font-bold text-on-surface border border-outline-variant/40 shadow-2xs">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-on-surface-variant border-t border-outline-variant/30">
          Press <kbd className="px-1.5 py-0.2 rounded bg-surface-container font-mono text-[10px] font-bold">Esc</kbd> or click outside to dismiss
        </div>
      </div>
    </div>
  );
}

// Backward-compatible export
export function KeyboardShortcutBar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  if (!isOpen || !onClose) return null;
  return <KeyboardShortcutModal isOpen={isOpen} onClose={onClose} />;
}
