import React from "react";
import { jobsService } from "../jobsService";
import { JobDashboardList } from "./components/JobDashboardList";

export async function DashboardPage() {
  const initialJobs = await jobsService.getAllJobs();
  return <JobDashboardList initialJobs={initialJobs} />;
}
