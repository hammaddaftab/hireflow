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
} as const;

/**
 * Centralized Sidebar Navigation Items with Route Matching Rules
 */
export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    description: "Overview of job openings and applicant screening pipelines",
    matchPatterns: ["/"],
  },
  {
    id: "create-requirement",
    label: "Create Requirement",
    href: ROUTES.NEW_JOB,
    description: "Define job metadata, dealbreaker knockouts, and soft scoring criteria",
    matchPatterns: ["/jobs/new"],
  },
];

/**
 * Route segment labels used for dynamic breadcrumbs
 */
export const ROUTE_LABEL_MAP: Record<string, string> = {
  jobs: "Job Postings",
  new: "New Requirement Schema",
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
