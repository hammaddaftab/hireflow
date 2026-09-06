"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Typography } from "@/components/ui/Typography";
import { ROUTES } from "@/config/navigation";
import { useGetJobsQuery, useDeleteJobMutation } from "../../jobsApi";
import type { Job } from "@/entities/job";

export interface JobDashboardListProps {
  initialJobs?: Job[];
}

// Helper to format educational requirement into human-readable string
function formatEducation(edu?: Job["education_min"]): string | null {
  if (!edu || !edu.active) return null;
  const levelMap: Record<string, string> = {
    bachelors: "Bachelors",
    masters: "Masters",
    doctorate: "Doctorate",
    diploma: "Diploma",
    high_school: "High School",
  };
  const degreeStr = edu.degree_level ? levelMap[edu.degree_level] || edu.degree_level : null;
  const fieldStr = edu.field ? edu.field.trim() : null;

  if (degreeStr && fieldStr) return `${degreeStr} in ${fieldStr}`;
  if (degreeStr) return `${degreeStr} Degree`;
  if (fieldStr) return `Degree in ${fieldStr}`;
  return "Degree Required";
}

// Helper to format experience into human-readable string
function formatExperience(exp?: Job["min_experience"]): string | null {
  if (!exp || !exp.active) return null;
  if (typeof exp.years !== "number" || exp.years === 0) return "Entry Level (0+ yrs)";
  return exp.years === 1 ? "1 Year" : `${exp.years}+ Years`;
}

// Helper to format department, work arrangement, and location
function formatWorkLocation(job: Job): string {
  const parts: string[] = [];
  if (job.department) parts.push(job.department);
  if (job.work_mode?.active && job.work_mode.mode) {
    const mode = job.work_mode.mode.charAt(0).toUpperCase() + job.work_mode.mode.slice(1);
    parts.push(mode);
  }
  if (job.location && job.location !== "Flexible / Remote") {
    parts.push(job.location);
  }
  return parts.length > 0 ? parts.join(" • ") : "Flexible / Remote";
}

// Computes summary counts of hard dealbreakers vs soft scored criteria for a job
function getScreeningSummary(job: Job) {
  let hardCount = 0;
  let softCount = 0;

  if (job.min_experience?.active) {
    job.min_experience.blocking ? hardCount++ : softCount++;
  }
  if (job.education_min?.active) {
    job.education_min.blocking ? hardCount++ : softCount++;
  }
  if (job.work_mode?.active) {
    job.work_mode.blocking ? hardCount++ : softCount++;
  }
  if (job.location_requirement?.active) {
    job.location_requirement.blocking ? hardCount++ : softCount++;
  }
  if (job.compensation_band?.active) {
    job.compensation_band.blocking ? hardCount++ : softCount++;
  }
  if (job.max_notice_period?.active) {
    job.max_notice_period.blocking ? hardCount++ : softCount++;
  }

  const requiredSkills = (job.skills_required || []).filter((s) => s.active !== false);
  const preferredSkills = (job.skills_preferred || []).filter((s) => s.active !== false);

  if (requiredSkills.length > 0) {
    hardCount += 1;
  }
  if (preferredSkills.length > 0) {
    softCount += 1;
  }

  return {
    hardCount,
    softCount,
    requiredSkills,
    preferredSkills,
  };
}

export function JobDashboardList({ initialJobs }: JobDashboardListProps) {
  // RTK Query client-side state & automated cache invalidation
  const { data: jobs = initialJobs || [], isLoading: isQueryLoading, error: queryError } = useGetJobsQuery();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const loading = isQueryLoading && !initialJobs;
  const error = actionError || (queryError ? "Failed to load job listings" : null);

  const handleDelete = async (id: string) => {
    try {
      setActionError(null);
      await deleteJob(id).unwrap();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete job");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Typography variant="headline-medium" as="h1">
            Job Positions
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant mt-1">
            Configure transparent candidate filtering criteria, knockout rules, and weighted soft scores.
          </Typography>
        </div>
        <Link href={ROUTES.NEW_JOB}>
          <Button variant="primary" size="md">
            <Plus className="mr-2 h-4 w-4" />
            Create New Job
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-surface-container" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <Typography variant="title-medium" as="h3">
            No Job Positions Found
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant mt-1">
            Get started by creating your first position with transparent knockout filters.
          </Typography>
          <div className="mt-6">
            <Link href={ROUTES.NEW_JOB}>
              <Button variant="primary" size="md">
                <Plus className="mr-2 h-4 w-4" />
                Create Position
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const { hardCount, softCount, requiredSkills, preferredSkills } = getScreeningSummary(job);
            const experienceText = formatExperience(job.min_experience);
            const educationText = formatEducation(job.education_min);
            const workModeText = job.work_mode?.active && job.work_mode.mode
              ? job.work_mode.mode.charAt(0).toUpperCase() + job.work_mode.mode.slice(1)
              : null;

            return (
              <Card
                key={job.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group bg-surface-container-lowest border border-outline-variant rounded-xl p-5"
              >
                <div className="space-y-4">
                  {/* Header: Title, Status, and Location */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Typography variant="title-medium" as="h2" className="font-bold text-on-surface leading-snug">
                        {job.title}
                      </Typography>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 border ${
                          job.status === "active"
                            ? "bg-surface text-on-surface border-outline-variant font-semibold"
                            : "bg-surface-container text-on-surface-variant border-outline-variant/40"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <Typography variant="body-small" className="text-on-surface-variant mt-1 font-medium">
                      {formatWorkLocation(job)}
                    </Typography>
                  </div>

                  {/* Core Structured Criteria */}
                  <div className="space-y-1.5 border-t border-outline-variant/60 pt-3">
                    {experienceText && (
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-on-surface-variant font-medium">Experience</span>
                        <span className="font-semibold text-on-surface">
                          {experienceText}
                        </span>
                      </div>
                    )}

                    {educationText && (
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-on-surface-variant font-medium">Education</span>
                        <span className="font-semibold text-on-surface truncate max-w-[170px]" title={educationText}>
                          {educationText}
                        </span>
                      </div>
                    )}

                    {workModeText && (
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-on-surface-variant font-medium">Work Arrangement</span>
                        <span className="font-semibold text-on-surface capitalize">
                          {workModeText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Required Skills (Dealbreakers) */}
                  {requiredSkills.length > 0 && (
                    <div className="space-y-1.5 border-t border-outline-variant/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Required Skills ({requiredSkills.length})
                        </span>
                        <span className="text-[9px] font-mono text-on-surface-variant">Must Have</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {requiredSkills.slice(0, 4).map((item) => (
                          <span
                            key={item.skill}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-highest text-on-surface border border-outline-variant/60"
                          >
                            {item.skill}
                          </span>
                        ))}
                        {requiredSkills.length > 4 && (
                          <span className="text-[10px] text-on-surface-variant font-medium self-center px-1">
                            +{requiredSkills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preferred Skills (Bonus) */}
                  {preferredSkills.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Preferred Skills ({preferredSkills.length})
                        </span>
                        <span className="text-[9px] font-mono text-on-surface-variant">Bonus</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preferredSkills.slice(0, 3).map((item) => (
                          <span
                            key={item.skill}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container/60 text-on-surface-variant border border-outline-variant/30"
                          >
                            {item.skill}
                          </span>
                        ))}
                        {preferredSkills.length > 3 && (
                          <span className="text-[10px] text-on-surface-variant font-medium self-center px-1">
                            +{preferredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-outline-variant flex items-center justify-between gap-2">
                  <Link href={ROUTES.REVIEW} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Open Review Queue
                    </Button>
                  </Link>
                  <Link href={ROUTES.EDIT_JOB(job.id)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      aria-label={`Edit requirements for ${job.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 cursor-pointer"
                    aria-label={`Delete ${job.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
