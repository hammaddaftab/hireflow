import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/navigation";
import type { FormFieldState, RequirementMode } from "@/features/jobs/types";
import {
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@/features/jobs/jobsApi";
import { initialRequirementsFields } from "../components/ScreeningCriteria/requirementsData";
import { populateFieldsFromJob, buildJobPayload } from "../utils/jobPayload";

export interface UseJobFormOptions {
  jobId?: string;
}

export interface FormAlertState {
  variant: "success" | "info" | "error";
  title: string;
  message: string;
}

export function useJobForm(options?: UseJobFormOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeJobId = options?.jobId || searchParams?.get("id") || searchParams?.get("jobId") || undefined;
  const isEditMode = Boolean(activeJobId);

  const { data: existingJob, isLoading: isLoadingExisting, error: fetchError } = useGetJobByIdQuery(
    activeJobId!,
    { skip: !activeJobId }
  );
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const isSaving = isCreating || isUpdating;

  const [step, setStep] = useState<1 | 2>(1);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Step 1: Role Identity State
  const [title, setTitle] = useState("Senior Fullstack Engineer");
  const [department, setDepartment] = useState("Core Platform");

  // Step 2: Screening Criteria State
  const [fields, setFields] = useState<Record<string, FormFieldState>>(initialRequirementsFields);

  const [alert, setAlert] = useState<FormAlertState | null>(null);

  // Pre-fill existing job data when in edit mode
  useEffect(() => {
    if (existingJob) {
      setTitle(existingJob.title || "");
      setDepartment(existingJob.department || "");
      setFields((prev) => populateFieldsFromJob(existingJob, prev));
    }
  }, [existingJob]);

  const isStep2Unlocked = Boolean(title.trim() && department.trim());

  const handleContinueToCriteria = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isStep2Unlocked) {
      setAlert({
        variant: "error",
        title: "Incomplete Role Identity",
        message: "Please fill in all required role identity fields before proceeding.",
      });
      return;
    }
    setAlert(null);
    setStep(2);
  }, [isStep2Unlocked]);

  const handleToggleFieldMode = useCallback((id: string) => {
    setFields((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const nextMode: RequirementMode = current.mode === "hard" ? "soft" : "hard";
      return {
        ...prev,
        [id]: {
          ...current,
          mode: nextMode,
        },
      };
    });
  }, []);

  const handleToggleFieldActive = useCallback((id: string) => {
    setFields((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          active: current.active === false ? true : false,
        },
      };
    });
  }, []);

  const handleUpdateFieldValue = useCallback((id: string, value: string | number) => {
    setFields((prev) => ({
      ...prev,
      [id]: { ...prev[id], value },
    }));
  }, []);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = buildJobPayload(title, department, fields);

    try {
      if (isEditMode && activeJobId) {
        await updateJob({ id: activeJobId, input: payload }).unwrap();
        setAlert({
          variant: "success",
          title: "Requirements Specification Updated",
          message: "Job criteria updated and persisted to database. Ready for resume ingestion evaluation.",
        });
      } else {
        await createJob(payload).unwrap();
        setAlert({
          variant: "success",
          title: "Requirements Specification Saved",
          message: "Unified criteria configured and persisted to database. Ready for resume ingestion evaluation.",
        });
      }

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 1000);
    } catch (err) {
      console.error("Failed to save job requirements:", err);
      setAlert({
        variant: "error",
        title: isEditMode ? "Update Failed" : "Save Failed",
        message: err instanceof Error ? err.message : "Failed to persist job requirements. Please check inputs.",
      });
    }
  }, [title, department, fields, isEditMode, activeJobId, updateJob, createJob, router]);

  return {
    step,
    setStep,
    isGuideOpen,
    setIsGuideOpen,
    isOverlayOpen,
    setIsOverlayOpen,
    title,
    setTitle,
    department,
    setDepartment,
    fields,
    alert,
    setAlert,
    isEditMode,
    activeJobId,
    isStep2Unlocked,
    isLoadingExisting,
    fetchError,
    isSaving,
    handleContinueToCriteria,
    handleToggleFieldMode,
    handleToggleFieldActive,
    handleUpdateFieldValue,
    handleSave,
  };
}
