import { FEATURES } from "./features";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  matchPatterns?: (string | RegExp)[];
}

/**
 * Centralized Application Route Constants
 */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/",
  NEW_JOB: "/jobs/new",
  JOB_DETAILS: (id: string) => `/jobs/${id}`,
  EDIT_JOB: (id: string) => `/jobs/${id}/edit`,
  REVIEW: "/review",
  GROUPS: "/groups",
  UPLOADS: "/uploads",
  EVALS: "/evals/experience",
} as const;

// Centralized Sidebar Navigation Items with Route Matching Rules
const ALL_SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    description: "Overview of job openings and applicant screening pipelines",
    matchPatterns: ["/"],
  },
  {
    id: "review-queue",
    label: "Review Queue",
    href: ROUTES.REVIEW,
    description: "Rapid candidate screening queue with two-layer evidence disclosure",
    matchPatterns: ["/review"],
  },
  {
    id: "uploads",
    label: "Resume Uploads",
    href: ROUTES.UPLOADS,
    description: "Candidate resumes stored in Vercel Blob Storage staged for Step 2",
    matchPatterns: ["/uploads"],
  },
  {
    id: "evals",
    label: "AI Stress Test",
    href: ROUTES.EVALS,
    description: "Benchmark AI experience parsing, date arithmetic, and extraction accuracy",
    matchPatterns: ["/evals"],
  },
  {
    id: "groups",
    label: "Candidate Groups",
    href: ROUTES.GROUPS,
    description: "Interactive node graph of candidate clusters and pipeline branches",
    matchPatterns: ["/groups"],
  },
  {
    id: "create-requirement",
    label: "Create Requirement",
    href: ROUTES.NEW_JOB,
    description: "Define job metadata, dealbreaker knockouts, and soft scoring criteria",
    matchPatterns: ["/jobs/new"],
  },
];

export const SIDEBAR_NAV_ITEMS: NavItem[] = ALL_SIDEBAR_NAV_ITEMS.filter((item) => {
  if (item.id === "groups" && !FEATURES.CANDIDATE_GROUPS) {
    return false;
  }
  if (item.id === "evals" && !FEATURES.AI_EVALS) {
    return false;
  }
  return true;
});

/**
 * Route segment labels used for dynamic breadcrumbs
 */
export const ROUTE_LABEL_MAP: Record<string, string> = {
  jobs: "Job Postings",
  new: "New Requirement Schema",
  review: "Review Queue",
  uploads: "Resume Uploads",
  candidates: "Candidates",
  analytics: "Analytics",
  settings: "Settings",
};

/**
 * Determines whether a sidebar navigation item should be styled as active
 * for the current URL pathname.
 */
export function isNavItemActive(item: NavItem, currentPathname: string): boolean {
  if (item.href === currentPathname) {
    return true;
  }

  if (item.matchPatterns) {
    return item.matchPatterns.some((pattern) => {
      if (typeof pattern === "string") {
        return pattern === currentPathname;
      }
      return pattern.test(currentPathname);
    });
  }

  // Exact fallback for root
  if (item.href === "/") {
    return currentPathname === "/";
  }

  return currentPathname.startsWith(item.href);
}
