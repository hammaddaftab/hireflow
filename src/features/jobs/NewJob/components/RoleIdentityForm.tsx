"use client";

import React from "react";
import { GroupContainer } from "@/components/ui/GroupContainer";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

export interface RoleIdentityFormProps {
  title: string;
  setTitle: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
  seniority: string;
  setSeniority: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  onContinue: (e: React.FormEvent) => void;
}

export function RoleIdentityForm({
  title,
  setTitle,
  department,
  setDepartment,
  seniority,
  setSeniority,
  description,
  setDescription,
  onContinue,
}: RoleIdentityFormProps) {
  return (
    <form onSubmit={onContinue} className="space-y-6">
      <GroupContainer
        index={0}
        title="Role Identity & Overview"
        description="Core job metadata used for candidate matching context and pipeline classification."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
          <div className="space-y-1.5">
            <Typography variant="label-medium" as="label" htmlFor="job-title" className="block">
              Job Title <span className="text-red-500">*</span>
            </Typography>
            <input
              id="job-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              required
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <Typography variant="label-medium" as="label" htmlFor="department" className="block">
              Department <span className="text-red-500">*</span>
            </Typography>
            <input
              id="department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              required
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <Typography variant="label-medium" as="label" htmlFor="seniority" className="block">
              Seniority Level
            </Typography>
            <select
              id="seniority"
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="Entry Level">Entry Level</option>
              <option value="Mid-Senior Level">Mid-Senior Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Staff / Principal">Staff / Principal</option>
              <option value="Lead / Management">Lead / Management</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Typography variant="label-medium" as="label" htmlFor="role-summary" className="block">
              Role Summary
            </Typography>
            <input
              id="role-summary"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of role expectations..."
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant shadow-surface transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </GroupContainer>

      {/* Step 1 Action Bar */}
      <div className="flex items-center justify-end border-t border-outline-variant pt-5">
        <Button type="submit" variant="primary" size="md">
          Confirm Role Identity & Continue
        </Button>
      </div>
    </form>
  );
}
