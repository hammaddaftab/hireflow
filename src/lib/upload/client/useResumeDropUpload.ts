"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { DroppedResumeItem, ResumeUploadApiResponse } from "../types";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import { isValidResumeExtension } from "../validateResume";
import { uploadResumeFiles, sequentiallyIngestUploads } from "./uploadOrchestrator";

export interface UseResumeDropUploadProps {
  jobId?: string;
  onCandidateIngested?: (candidate: ParsedCandidateProfile) => void;
  onIngestComplete?: (count: number) => void;
  onError?: (error: string) => void;
  onStoredInBlob?: (upload: DroppedResumeItem) => void;
}

export interface UseResumeDropUploadReturn {
  isDraggingOver: boolean;
  uploads: DroppedResumeItem[];
  isUploading: boolean;
  statusLabel: string | null;
  uploadFiles: (fileList: FileList | File[]) => Promise<void>;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
}

export function useResumeDropUpload({
  jobId,
  onCandidateIngested,
  onIngestComplete,
  onError,
  onStoredInBlob,
}: UseResumeDropUploadProps = {}): UseResumeDropUploadReturn {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploads, setUploads] = useState<DroppedResumeItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);

  // Counter to prevent flickering over child DOM elements during drag
  const dragCounterRef = useRef(0);

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((item) => item.status !== "stored"));
  }, []);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const incomingFiles = Array.from(fileList);
      if (incomingFiles.length === 0) return;

      const validFiles: File[] = [];
      const invalidEntries: DroppedResumeItem[] = [];

      incomingFiles.forEach((file) => {
        if (isValidResumeExtension(file.name)) {
          validFiles.push(file);
        } else {
          invalidEntries.push({
            id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            filename: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
            status: "error",
            error: "Unsupported format. Allowed: PDF, TXT",
            jobId: jobId || null,
          });
        }
      });

      if (invalidEntries.length > 0) {
        setUploads((prev) => [...invalidEntries, ...prev]);
        onError?.(`Unsupported file format. Allowed: PDF, TXT`);
      }

      if (validFiles.length === 0) return;

      // Create optimistic pending items
      const pendingItems: DroppedResumeItem[] = validFiles.map((file) => ({
        id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        filename: file.name,
        size: file.size,
        contentType: file.type || "application/pdf",
        status: "uploading",
        progress: 30,
        jobId: jobId || null,
      }));

      setUploads((prev) => [...pendingItems, ...prev]);
      setIsUploading(true);
      setStatusLabel("Uploading resumes...");

      try {
        const data: ResumeUploadApiResponse = await uploadResumeFiles({
          files: validFiles,
          jobId,
        });

        // Replace pending items with confirmed Vercel Blob records
        setUploads((prev) => {
          let updated = [...prev];
          data.uploads.forEach((uploaded: DroppedResumeItem, idx: number) => {
            const pendingId = pendingItems[idx]?.id;
            const matchIndex = updated.findIndex((u) => u.id === pendingId);
            if (matchIndex !== -1) {
              updated[matchIndex] = uploaded;
            } else {
              updated = [uploaded, ...updated];
            }
            onStoredInBlob?.(uploaded);
          });
          return updated;
        });

        // Sequentially execute candidate profile extraction, strictly scoped to current jobId
        if (jobId && data.uploads && data.uploads.length > 0) {
          const ingestedCount = await sequentiallyIngestUploads(
            data.uploads,
            jobId,
            {
              onStartItem: (i, total) => {
                setStatusLabel(
                  total > 1
                    ? `Extracting profile ${i + 1} of ${total}...`
                    : "Extracting candidate profile..."
                );
              },
              onCandidateIngested,
              onError: (msg) => onError?.(msg),
            }
          );

          if (ingestedCount > 0) {
            onIngestComplete?.(ingestedCount);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error uploading to Vercel Blob";
        setUploads((prev) =>
          prev.map((item) =>
            pendingItems.some((p) => p.id === item.id)
              ? { ...item, status: "error", error: message }
              : item
          )
        );
        onError?.(message);
      } finally {
        setIsUploading(false);
        setStatusLabel(null);
      }
    },
    [jobId, onCandidateIngested, onIngestComplete, onError, onStoredInBlob]
  );

  // Global window drag and drop listener for candidate resume drops
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files")) {
        dragCounterRef.current += 1;
        setIsDraggingOver(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [uploadFiles]);

  return {
    isDraggingOver,
    uploads,
    isUploading,
    statusLabel,
    uploadFiles,
    removeUpload,
    clearCompleted,
  };
}
