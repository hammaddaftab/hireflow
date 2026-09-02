import { useGetJobsQuery, useDeleteJobMutation, useCreateJobMutation } from "../jobsApi";
import { CreateJobInput } from "@/types";

export function useJobs() {
  const { data: jobs = [], isLoading: loading, error, refetch } = useGetJobsQuery();
  const [deleteJobMutation] = useDeleteJobMutation();
  const [createJobMutation] = useCreateJobMutation();

  const deleteJob = async (id: string) => {
    return deleteJobMutation(id).unwrap();
  };

  const createJob = async (input: CreateJobInput) => {
    return createJobMutation(input).unwrap();
  };

  const errorMessage = error
    ? "status" in error
      ? `Error: ${JSON.stringify(error.data)}`
      : error.message || "An error occurred"
    : null;

  return {
    jobs,
    loading,
    error: errorMessage,
    refreshJobs: refetch,
    deleteJob,
    createJob,
  };
}
