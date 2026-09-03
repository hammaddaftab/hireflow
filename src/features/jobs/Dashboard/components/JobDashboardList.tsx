"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Typography } from "@/components/ui/Typography";
import { ROUTES } from "@/config/navigation";
import { useGetJobsQuery, useDeleteJobMutation } from "../../jobsApi";
import { Job } from "../../types";

export interface JobDashboardListProps {
  initialJobs?: Job[];
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
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Typography variant="title-medium" as="h2">
                    {job.title}
                  </Typography>
                  <Badge variant={job.status === "active" ? "success" : "default"}>
                    {job.status}
                  </Badge>
                </div>
                <Typography variant="body-small" className="text-on-surface-variant mt-1 font-medium">
                  {job.department} &bull; {job.location}
                </Typography>

                <Typography variant="body-medium" className="mt-3 text-on-surface line-clamp-2">
                  {job.description}
                </Typography>

                <div className="mt-4 space-y-2 border-t border-outline-variant pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <Typography variant="label-small" className="text-on-surface-variant">
                      Min Experience:
                    </Typography>
                    <Typography variant="label-small" className="font-semibold text-on-surface">
                      {job.hardCriteria.minYearsExperience} Years
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <Typography variant="label-small" className="text-on-surface-variant">
                      Strict Knockout:
                    </Typography>
                    <Typography variant="label-small" className="font-semibold text-on-surface">
                      {job.hardCriteria.isStrictKnockout ? "Enabled" : "Disabled"}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <Typography variant="label-small" className="text-on-surface-variant">
                      Soft Scoring Weight:
                    </Typography>
                    <Typography variant="label-small" className="font-semibold text-on-surface">
                      {job.softCriteria.weight} / 5
                    </Typography>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {job.hardCriteria.mandatorySkills.map((skill) => (
                    <Badge key={skill} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                  {job.softCriteria.preferredSkills.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-outline-variant flex items-center justify-between gap-2">
                <Link href={ROUTES.REVIEW} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    Open Review Queue
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(job.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                  aria-label={`Delete ${job.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
