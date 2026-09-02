"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Typography } from "@/components/ui/Typography";
import { OverlayContainer } from "@/components/ui/OverlayContainer";
import { ROUTES } from "@/config/navigation";
import type { FormFieldState, RequirementMode } from "@/features/jobs/types";

// 4 Direct Children from components/
import { JobFormStepper } from "./components/JobFormStepper";
import { RoleIdentityForm } from "./components/RoleIdentityForm";
import { ScreeningCriteriaForm } from "./components/ScreeningCriteria/ScreeningCriteriaForm";
import { initialRequirementsFields } from "./components/ScreeningCriteria/requirementsData";
import { EvaluationTaxonomyModal } from "./components/EvaluationTaxonomyModal";

export function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Step 1: Role Identity State
  const [title, setTitle] = useState("Senior Fullstack Engineer");
  const [department, setDepartment] = useState("Core Platform");
  const [seniority, setSeniority] = useState("Senior Level");
  const [description, setDescription] = useState(
    "Lead Next.js frontend architecture and scalable backend service delivery for modern hiring pipelines."
  );

  // Step 2: Screening Criteria State
  const [fields, setFields] = useState<Record<string, FormFieldState>>(initialRequirementsFields);

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

  const handleUpdateFieldValue = (id: string, value: string | number) => {
    setFields((prev) => ({
      ...prev,
      [id]: { ...prev[id], value },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({
      variant: "success",
      title: "Requirements Specification Saved",
      message: "Unified criteria configured. Ready for resume ingestion screening evaluation.",
    });

    setTimeout(() => {
      router.push(ROUTES.DASHBOARD);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Typography variant="headline-large" as="h1">
            Define Job Requirements
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant mt-1">
            Configure hard knockout criteria for deterministic rejection and soft weighted scoring preferences.
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
          seniority={seniority}
          setSeniority={setSeniority}
          description={description}
          setDescription={setDescription}
          onContinue={handleContinueToCriteria}
        />
      )}

      {/* 3. Step 2: Screening Criteria Form Component */}
      {step === 2 && (
        <ScreeningCriteriaForm
          fields={fields}
          onToggleMode={handleToggleFieldMode}
          onUpdateValue={handleUpdateFieldValue}
          onBack={() => setStep(1)}
          onSave={handleSave}
          onPreviewOverlay={() => setIsOverlayOpen(true)}
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
              {title} ({seniority}) — {department}
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
