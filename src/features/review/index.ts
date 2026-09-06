// Single feature facade for Next.js app routes

// Composed whole-page views
export { ReviewQueuePage } from "./views/queue/ReviewQueuePage";
export { FocusReviewPage } from "./views/focus/FocusReviewPage";

// Review queue construction service
export { buildReviewQueue } from "./core/services/reviewQueueService";

// Canonical domain types
export type { CandidateReviewItem, QueryGroup } from "./types";
export type { DroppedResumeItem, ResumeUploadStatus, ResumeUploadApiResponse } from "./types";
export * from "./core/evaluators/evaluationStatuses";

// Candidate resume upload & Vercel Blob ingestion
export { useResumeDropUpload } from "./views/queue/hooks/useResumeDropUpload";
export { ResumeDropOverlay } from "./views/queue/components/ResumeDropOverlay";
export { ResumeDropTrigger } from "./views/queue/components/ResumeDropTrigger";
export { ResumeIngestionDrawer } from "./views/queue/components/ResumeIngestionDrawer";
