import { baseApi } from "@/lib/redux/api";
import { Job } from "./types";
import { CreateJobInput } from "@/types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    detail?: string;
  };
}

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<Job[], void>({
      query: () => "/jobs",
      transformResponse: (response: ApiResponse<Job[]>) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Job" as const, id })),
              { type: "Job", id: "LIST" },
            ]
          : [{ type: "Job", id: "LIST" }],
    }),
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      transformResponse: (response: ApiResponse<Job>) => {
        if (!response.data) throw new Error("Job not found");
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: "Job", id }],
    }),
    createJob: builder.mutation<Job, CreateJobInput>({
      query: (input) => ({
        url: "/jobs",
        method: "POST",
        body: input,
      }),
      transformResponse: (response: ApiResponse<Job>) => {
        if (!response.data) throw new Error("Failed to create job");
        return response.data;
      },
      invalidatesTags: [{ type: "Job", id: "LIST" }],
    }),
    deleteJob: builder.mutation<void, string>({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Job", id },
        { type: "Job", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useDeleteJobMutation,
} = jobsApi;
