"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Typography } from "@/components/ui/Typography";
import { OverlayContainer } from "@/components/ui/OverlayContainer";
import { ROUTES } from "@/config/navigation";

// Form Components
import { JobFormStepper } from "./components/JobFormStepper";
import { RoleIdentityForm } from "./components/RoleIdentityForm";
import { ScreeningCriteriaForm } from "./components/ScreeningCriteria/ScreeningCriteriaForm";
import { EvaluationTaxonomyModal } from "./components/EvaluationTaxonomyModal";

// Form State & Logic Hook
import { useJobForm } from "./hooks/useJobForm";

export interface NewJobPageProps {
  jobId?: string;
}

function JobFormInner({ jobId }: NewJobPageProps) {
  const router = useRouter();
  const {
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
  } = useJobForm({ jobId });

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
              ? "Update role identity, dealbreaker criteria, and soft scoring preferences."
              : "Configure hard dealbreaker criteria for deterministic evaluation and soft weighted scoring preferences."}
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

      {/* Stepper Component */}
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

      {/* Step 1: Role Identity Form Component */}
      {step === 1 && (
        <RoleIdentityForm
          title={title}
          setTitle={setTitle}
          department={department}
          setDepartment={setDepartment}
          onContinue={handleContinueToCriteria}
        />
      )}

      {/* Step 2: Screening Criteria Form Component */}
      {step === 2 && (
        <ScreeningCriteriaForm
          fields={fields}
          onToggleMode={handleToggleFieldMode}
          onUpdateValue={handleUpdateFieldValue}
          onToggleActive={handleToggleFieldActive}
          onBack={() => setStep(1)}
          onSave={handleSave}
          onPreviewOverlay={() => setIsOverlayOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          submitLabel={isEditMode ? "Update Requirements Schema" : "Save Requirements Schema"}
        />
      )}

      {/* Evaluation Taxonomy Modal Component */}
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
