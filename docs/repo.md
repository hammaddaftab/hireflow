# Repository Rules

## Typography
- Prefer [`/src/components/ui/Typography.tsx`](/src/components/ui/Typography.tsx) whenever a matching variant exists (`headline`, `title`, `body`, `label`).
- Add new variants to `Typography.tsx` if preferred, or use inline styles for one-offs.

## Theming & Material Design 3
- We follow the official Material Design 3 (M3) design token system via Tailwind and CSS variables—**not** the MUI library.
- **Surfaces & Roles**: Express elevation and contrast using M3 semantic tokens rather than raw grays:
  - Surfaces: `surface`, `surface-dim`, `surface-bright`, and containers (`surface-container-lowest` through `highest`).
  - Content: `on-surface` (primary text/icons) and `on-surface-variant` (secondary/muted text).
  - Structure: `outline` / `outline-variant` (borders) and `scrim` (modal backdrop).
- **Critical UI Components**:
  - [`Card`](/src/components/ui/Card.tsx): Content container resting on `surface-container-lowest` with `outline-variant` borders.
  - [`GroupContainer`](/src/components/ui/GroupContainer.tsx): Section wrapper managing vertical rhythm and M3 header typography.
  - [`OverlayContainer`](/src/components/ui/OverlayContainer.tsx): Dialog/modal elevated at `surface-container-high` over a `scrim` backdrop.
  - [`Button`](/src/components/ui/Button.tsx): Action triggers mapping to M3 `primary`, `on-primary`, and outline variants.

## File Structure & Architecture
- **Route Hierarchy (`src/app/`)**: Route files only define hierarchy/metadata and use one-liner imports from features (e.g., `export { DashboardPage as default } from "@/features/jobs";`).
- **Feature Encapsulation (`src/features/<feature_name>/`)**: All application logic and UI live in feature folders.
- **Single File vs Directory**: Use a standalone file (e.g., `jobsApi.ts`, `useJobs.ts`) for a concern; create a directory (`components/`, `hooks/`, `api/`, `services/`) only when more than one file is needed.
- **Nesting & Sibling Imports**: Directories can have subdirectories if a single concern spans multiple files, but avoid further nesting. Sibling files/directories can import directly from each other.
- **Promotion to Shared Level**: When any top-level concern or directory in a feature is consumed by more than one feature, promote it to the shared root level (`src/components/`, `src/hooks/`, `src/lib/`, `src/services/`).

## Linking Convention
- Markdown links must always treat the repository root as the path root (e.g., [`/src/...`](/src/)).
