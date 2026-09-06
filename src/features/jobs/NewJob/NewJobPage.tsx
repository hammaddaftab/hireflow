"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { produce } from "immer";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Typography } from "@/components/ui/Typography";
import { OverlayContainer } from "@/components/ui/OverlayContainer";
import { ROUTES } from "@/config/navigation";
import type { FormFieldState, RequirementMode, CreateJobInput } from "@/features/jobs/types";
import type { Job } from "@/entities/job";
import {
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@/features/jobs/jobsApi";

// 4 Direct Children from components/
import { JobFormStepper } from "./components/JobFormStepper";
import { RoleIdentityForm } from "./components/RoleIdentityForm";
import { ScreeningCriteriaForm } from "./components/ScreeningCriteria/ScreeningCriteriaForm";
import { initialRequirementsFields } from "./components/ScreeningCriteria/requirementsData";
import { EvaluationTaxonomyModal } from "./components/EvaluationTaxonomyModal";

function parseSkillStrings(value: string | number | undefined): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Populates form fields from an existing job record using Immer produce
function populateFieldsFromJob(
  job: Job,
  baseFields: Record<string, FormFieldState>
): Record<string, FormFieldState> {
  return produce(baseFields, (draft) => {
    if (draft.minExperience && job.min_experience) {
      const exp = job.min_experience;
      draft.minExperience.value = "years" in exp && typeof exp.years === "number" ? exp.years : 0;
      draft.minExperience.mode = exp.blocking ? "hard" : "soft";
      draft.minExperience.active = exp.active !== false;
    }
    if (draft.skillsRequired && job.skills_required) {
      const skills = job.skills_required
        .map((s) => ("skill" in s && typeof s.skill === "string" ? s.skill : ""))
        .filter(Boolean);
      draft.skillsRequired.value = skills.join(", ");
      draft.skillsRequired.mode = job.skills_required.some((s) => s.blocking) ? "hard" : "soft";
      draft.skillsRequired.active =
        job.skills_required.length > 0 ? job.skills_required.some((s) => s.active !== false) : false;
    }
    if (draft.skillsPreferred && job.skills_preferred) {
      const skills = job.skills_preferred
        .map((s) => ("skill" in s && typeof s.skill === "string" ? s.skill : ""))
        .filter(Boolean);
      draft.skillsPreferred.value = skills.join(", ");
      draft.skillsPreferred.mode = job.skills_preferred.some((s) => s.blocking) ? "hard" : "soft";
      draft.skillsPreferred.active =
        job.skills_preferred.length > 0 ? job.skills_preferred.some((s) => s.active !== false) : false;
    }
    if (draft.degreeLevel && job.education_min) {
      const edu = job.education_min;
      draft.degreeLevel.value =
        "degree_level" in edu && typeof edu.degree_level === "string" ? edu.degree_level : "none";
      draft.degreeLevel.mode = edu.blocking ? "hard" : "soft";
      draft.degreeLevel.active = edu.active !== false;
    }
    if (draft.fieldOfStudy && job.education_min) {
      const edu = job.education_min;
      draft.fieldOfStudy.value = "field" in edu && typeof edu.field === "string" ? edu.field : "";
      draft.fieldOfStudy.mode = edu.blocking ? "hard" : "soft";
      draft.fieldOfStudy.active = edu.active !== false;
    }
    if (draft.locationCity && job.location_requirement) {
      const loc = job.location_requirement;
      draft.locationCity.value = "city" in loc && typeof loc.city === "string" ? loc.city : "Any";
      draft.locationCity.mode = loc.blocking ? "hard" : "soft";
      draft.locationCity.active = loc.active !== false;
    }
    if (draft.locationProvince && job.location_requirement) {
      const loc = job.location_requirement;
      draft.locationProvince.value =
        "province" in loc && typeof loc.province === "string" ? loc.province : "Any";
      draft.locationProvince.mode = loc.blocking ? "hard" : "soft";
      draft.locationProvince.active = loc.active !== false;
    }
    if (draft.workMode && job.work_mode) {
      const wm = job.work_mode;
      draft.workMode.value = "mode" in wm && typeof wm.mode === "string" ? wm.mode : "hybrid";
      draft.workMode.mode = wm.blocking ? "hard" : "soft";
      draft.workMode.active = wm.active !== false;
    }
    if (draft.compensationMin && job.compensation_band) {
      const cb = job.compensation_band;
      draft.compensationMin.value = "min" in cb && typeof cb.min === "number" ? cb.min : 400000;
      draft.compensationMin.mode = cb.blocking ? "hard" : "soft";
      draft.compensationMin.active = cb.active !== false;
    }
    if (draft.compensationMax && job.compensation_band) {
      const cb = job.compensation_band;
      draft.compensationMax.value = "max" in cb && typeof cb.max === "number" ? cb.max : 600000;
      draft.compensationMax.mode = cb.blocking ? "hard" : "soft";
      draft.compensationMax.active = cb.active !== false;
    }
    if (draft.compensationCurrency && job.compensation_band) {
      const cb = job.compensation_band;
      draft.compensationCurrency.value =
        "currency" in cb && typeof cb.currency === "string" ? cb.currency : "PKR";
      draft.compensationCurrency.mode = cb.blocking ? "hard" : "soft";
      draft.compensationCurrency.active = cb.active !== false;
    }
    if (draft.noticePeriod && job.max_notice_period) {
      const np = job.max_notice_period;
      draft.noticePeriod.value = "value" in np && typeof np.value === "number" ? np.value : 30;
      draft.noticePeriod.mode = np.blocking ? "hard" : "soft";
      draft.noticePeriod.active = np.active !== false;
    }
    if (draft.noticePeriodUnit && job.max_notice_period) {
      const np = job.max_notice_period;
      draft.noticePeriodUnit.value = "unit" in np && typeof np.unit === "string" ? np.unit : "days";
      draft.noticePeriodUnit.mode = np.blocking ? "hard" : "soft";
      draft.noticePeriodUnit.active = np.active !== false;
    }
  });
}

export interface NewJobPageProps {
  jobId?: string;
}

function JobFormInner({ jobId }: NewJobPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeJobId = jobId || searchParams?.get("id") || searchParams?.get("jobId") || undefined;
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

  // Pre-fill existing job data when in edit mode
  useEffect(() => {
    if (existingJob) {
      setTitle(existingJob.title || "");
      setDepartment(existingJob.department || "");
      setFields((prev) => populateFieldsFromJob(existingJob, prev));
    }
  }, [existingJob]);

  const [alert, setAlert] = useState<{
    variant: "success" | "info" | "error";
    title: string;
    message: string;
  } | null>(null);

  const isStep2Unlocked = Boolean(title.trim() && department.trim());

  const handleContinueToCriteria = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleToggleFieldMode = (id: string) => {
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
  };

  const handleToggleFieldActive = (id: string) => {
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
  };

  const handleUpdateFieldValue = (id: string, value: string | number) => {
    setFields((prev) => ({
      ...prev,
      [id]: { ...prev[id], value },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const mandatorySkillsList = parseSkillStrings(fields.skillsRequired?.value);
    const preferredSkillsList = parseSkillStrings(fields.skillsPreferred?.value);
    const degreeValue = String(fields.degreeLevel?.value || "none");
    const validDegree =
      degreeValue === "none"
        ? null
        : (degreeValue as "bachelors" | "masters" | "doctorate" | "diploma" | "high_school");

    const workModeValue = String(fields.workMode?.value || "hybrid") as "onsite" | "hybrid" | "remote";
    const noticeUnitValue = String(fields.noticePeriodUnit?.value || "days") as "days" | "weeks" | "months";

    const payload: CreateJobInput = {
      title,
      department,
      location: (() => {
        const c = fields.locationCity?.value && fields.locationCity.value !== "Any" ? String(fields.locationCity.value).trim() : null;
        const p = fields.locationProvince?.value && fields.locationProvince.value !== "Any" ? String(fields.locationProvince.value).trim() : null;
        if (c && p) return `${c}, ${p}`;
        if (c) return c;
        if (p) return `${p}, Pakistan`;
        return "Flexible / Remote";
      })(),
      employmentType: "full-time",
      // TODO: Remove description and seniority_level from database schema and migrations in a future full schema cleanup
      description: null,
      seniority_level: null,

      // Canonical schema fields matching JobRequirementsExtractionSchema & Drizzle jobs table
      skills_required: mandatorySkillsList.map((skill) =>
        fields.skillsRequired?.active === false
          ? { active: false as const, blocking: fields.skillsRequired?.mode === "hard" }
          : { active: true as const, skill, blocking: fields.skillsRequired?.mode === "hard" }
      ),
      skills_preferred: preferredSkillsList.map((skill) =>
        fields.skillsPreferred?.active === false
          ? { active: false as const, blocking: fields.skillsPreferred?.mode === "hard" }
          : { active: true as const, skill, blocking: fields.skillsPreferred?.mode === "hard" }
      ),
      min_experience:
        fields.minExperience?.active === false
          ? { active: false as const, blocking: fields.minExperience?.mode === "hard" }
          : {
              active: true as const,
              years: Number(fields.minExperience?.value) || 0,
              blocking: fields.minExperience?.mode === "hard",
            },
      education_min:
        fields.degreeLevel?.active === false
          ? { active: false as const, blocking: fields.degreeLevel?.mode === "hard" }
          : {
              active: true as const,
              degree_level: validDegree,
              field: String(fields.fieldOfStudy?.value || "").trim() || null,
              blocking: fields.degreeLevel?.mode === "hard",
            },
      location_requirement:
        fields.locationCity?.active === false
          ? { active: false as const, blocking: fields.locationCity?.mode === "hard" }
          : {
              active: true as const,
              city:
                fields.locationCity?.value && fields.locationCity.value !== "Any"
                  ? String(fields.locationCity.value).trim()
                  : null,
              province:
                fields.locationProvince?.value && fields.locationProvince.value !== "Any"
                  ? String(fields.locationProvince.value).trim()
                  : null,
              blocking: fields.locationCity?.mode === "hard",
            },
      work_mode:
        fields.workMode?.active === false
          ? { active: false as const, blocking: fields.workMode?.mode === "hard" }
          : {
              active: true as const,
              mode: workModeValue,
              blocking: fields.workMode?.mode === "hard",
            },
      compensation_band:
        fields.compensationMax?.active === false
          ? { active: false as const, blocking: fields.compensationMax?.mode === "hard" }
          : {
              active: true as const,
              min: Number(fields.compensationMin?.value) || null,
              max: Number(fields.compensationMax?.value) || null,
              currency: String(fields.compensationCurrency?.value || "PKR"),
              blocking: fields.compensationMax?.mode === "hard",
            },
      max_notice_period:
        fields.noticePeriod?.active === false
          ? { active: false as const, blocking: fields.noticePeriod?.mode === "hard" }
          : {
              active: true as const,
              value: Number(fields.noticePeriod?.value) || null,
              unit: noticeUnitValue,
              blocking: fields.noticePeriod?.mode === "hard",
            },
      status: "active",
    };

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
  };

  if (activeJobId && isLoadingExisting) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container rounded w-1/3" />
          <div className="h-4 bg-surface-container rounded w-1/2" />
          <div className="h-64 bg-surface-container rounded-xl mt-8" />
        </div>
      </div>
    );
  }

  if (activeJobId && fetchError) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-12">
        <Alert variant="error" title="Job Not Found">
          Unable to locate requirements for this position. The position may have been deleted or archived.
        </Alert>
        <div>
          <Button variant="primary" size="md" onClick={() => router.push(ROUTES.DASHBOARD)}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Typography variant="headline-large" as="h1">
            {isEditMode ? "Edit Job Requirements" : "Define Job Requirements"}
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant mt-1">
            {isEditMode
              ? "Update role identity, knockout dealbreakers, and soft scoring preferences."
              : "Configure hard knockout criteria for deterministic rejection and soft weighted scoring preferences."}
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<HelpCircle className="h-4 w-4" />}
            onClick={() => setIsGuideOpen(true)}
          >
            How Screening Works
          </Button>
          <Button variant="outline" size="md" onClick={() => router.push(ROUTES.DASHBOARD)}>
            Cancel
          </Button>
        </div>
      </div>

      {/* 1. Stepper Component */}
      <JobFormStepper
        currentStep={step}
        onSelectStep={setStep}
        isStep2Unlocked={isStep2Unlocked}
      />

      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* 2. Step 1: Role Identity Form Component */}
      {step === 1 && (
        <RoleIdentityForm
          title={title}
          setTitle={setTitle}
          department={department}
          setDepartment={setDepartment}
          onContinue={handleContinueToCriteria}
        />
      )}

      {/* 3. Step 2: Screening Criteria Form Component */}
      {step === 2 && (
        <ScreeningCriteriaForm
          fields={fields}
          onToggleMode={handleToggleFieldMode}
          onUpdateValue={handleUpdateFieldValue}
          onToggleActive={handleToggleFieldActive}
          onBack={() => setStep(1)}
          onSave={handleSave}
          onPreviewOverlay={() => setIsOverlayOpen(true)}
          submitLabel={isEditMode ? "Update Requirements Schema" : "Save Requirements Schema"}
        />
      )}

      {/* 4. Evaluation Taxonomy Modal Component */}
      <EvaluationTaxonomyModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Preview Overlay Modal */}
      <OverlayContainer
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        title="Screening Criteria Preview"
        description="Material Design 3 Surface Container High overlay with Scrim backdrop"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOverlayOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSaving}
              onClick={() => {
                setIsOverlayOpen(false);
                setAlert({
                  variant: "success",
                  title: "Overlay Verified",
                  message: "Surface container overlay configuration validated.",
                });
              }}
            >
              Apply Schema
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-surface-container border border-outline-variant text-xs">
            <span className="font-bold text-on-surface">Target Role: </span>
            <span className="text-on-surface-variant">
              {title} — {department}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            This modal container renders on top of a Google Material Design 3{" "}
            <code className="font-mono text-on-primary-container bg-primary-container px-1 py-0.5 rounded border border-outline-variant">
              scrim
            </code>{" "}
            backdrop using{" "}
            <code className="font-mono text-on-primary-container bg-primary-container px-1 py-0.5 rounded border border-outline-variant">
              surface-container-high
            </code>{" "}
            elevation.
          </p>
        </div>
      </OverlayContainer>
    </div>
  );
}

export function NewJobPage(props: NewJobPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading requirements form...</div>}>
      <JobFormInner {...props} />
    </Suspense>
  );
}
