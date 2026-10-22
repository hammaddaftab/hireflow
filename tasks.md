## Task 1: Feature Module Boundary & 'server-only' Enforcement
- **Scope**: Eliminate mixed barrels across remaining feature directories and enforce strict server/client isolation using `server-only` and `client-only` markers.
- **Completed**:
  - `src/lib/extraction`: Shared catalogs exported via `index.ts`, server-only logic via `server.ts` with `server-only` guards on all internal normalizers and pipeline modules.
- **Pending**:
  - `src/lib/upload`: Audit and refactor `src/lib/upload/index.ts` to prevent client components from pulling in server document hash/ingestion modules.
  - `src/features/jobs`: Enforce explicit server boundary for `jobsService.ts`.
  - `src/features/evals`: Enforce explicit server boundary for LLM eval parsing services.