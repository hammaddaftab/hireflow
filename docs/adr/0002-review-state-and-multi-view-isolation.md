# ADR 0002: Decoupling Review Domain State from Multi-Modal Viewport Layouts

* **Status**: Accepted
* **Date**: 2026-09-05
* **Technical Domain**: `/src/features/review`

---

## 1. Context & Problem Statement

The candidate review workflow supports two distinct user interaction modes:
1. **Linear Triage Queue (`ReviewQueuePage` at `/review`)**: A fast, keyboard-driven vertical queue designed for rapid screening with status tabs and evidentiary summary pills.
2. **Focus Carousel (`FocusReviewPage` at `/review/focus`)**: A distraction-free full-screen review stage using circular SVG arc coordinates, 3D card perspective hints, and a floating action dock.

### Problems with the Initial Implementation
* **Coupled State in a Monolithic Hook**: A single 267-line hook (`useReviewQueue`) managed both headless candidate mutations (`keep`, `flag`, `pass`, review statistics, query filters) and layout-specific behavior (active carousel index, SVG arc rotation radians, pulse timers, and document keydown listeners).
* **Cross-View Coupling**: Queue components and carousel components lived in a single flat directory (`src/features/review/components`). This encouraged accidental cross-imports between views that should be independently maintained.
* **Unnecessary Bundle Overhead**: SVG coordinate math and 3D preview components were bundled into the standard triage queue route, increasing initial JavaScript download size for users only using the linear queue.
* **Brittle View Mode Flags**: Shared components like `CandidateCard` used internal conditional checks (`if (mode === "focus")`) to alter layouts, complicating future changes.

---

## 2. Decision Drivers

* **Isolate Views**: Ensure the Queue view and Carousel view cannot import each other or leak view-specific state.
* **Headless Domain Logic**: Keep candidate mutation state (`keep`, `flag`, `pass`) independent of visual layout, hotkeys, or animation timers.
* **Composable Presentation Components**: Allow `CandidateCard` to be shared between both views using slot props rather than internal conditional branching.
* **Independent Route Chunks**: Ensure Next.js splits `/review` and `/review/focus` into separate client bundles.

---

## 3. Considered Options

### Option A: Shared Core Layer with Isolated View Subdirectories (Chosen)
Group headless domain state, pure evaluators, and shared card atoms into `core/`. Place route-specific components and controllers into isolated sibling directories: `views/queue/` and `views/focus/`.

### Option B: Split into Two Completely Separate Top-Level Features
Create `src/features/review-queue/` and `src/features/review-focus/`.
* **Drawback**: Both views operate on the exact same candidate evaluation logic, requirement matching, and decision persistence. This would duplicate domain logic or force a fragile third "shared review" package.

### Option C: Single Directory with Mode Flags
Keep all components in one folder and pass `mode="queue" | "focus"` down through props.
* **Drawback**: Results in bloated route bundles, complex branching inside presentation components, and high regression risk when modifying either layout.

---

## 4. Decision Outcome

**Chosen Option**: **Option A (Shared Core Layer with Isolated View Subdirectories)**.

### 4.1 Directory Structure

```
src/features/review/
├── index.ts                           // Public feature facade for Next.js app routes
├── types.ts                           // Canonical review types (CandidateReviewItem, QueryGroup)
│
├── core/                              // Shared candidate logic, headless hooks, and card atoms
│   ├── services/
│   │   └── reviewQueueService.ts      // Queue construction, profile normalization, sort order
│   ├── hooks/
│   │   └── useReviewData.ts           // Headless candidate state (mutations, stats, query groups)
│   ├── evaluators/                    // Pure domain evaluators (zero React/DOM dependencies)
│   │   ├── experienceEvaluator.ts
│   │   ├── skillEvaluator.ts
│   │   ├── educationEvaluator.ts
│   │   └── logisticsEvaluator.ts
│   ├── components/
│   │   └── card/                      // Shared presentational card atoms
│   │       ├── CandidateCard.tsx      // Candidate card with action slots
│   │       ├── BlockingStrip.tsx      // Requirement status pills
│   │       └── EvidenceDrawer.tsx     // Resume quote evidence slideout
│   └── utils/                         // Pure utilities (calculations, styles, formatters)
│
└── views/                             // Isolated Route Views
    ├── queue/                         // Linear Triage Queue View
    │   ├── ReviewQueuePage.tsx        // Container page
    │   ├── hooks/
    │   │   └── useQueueView.ts        // Active item index, status tabs, queue hotkeys
    │   └── components/                // Controls, legend, shortcut bar
    │
    └── focus/                         // Circular Carousel View
        ├── FocusReviewPage.tsx        // Container page
        ├── hooks/
        │   └── useFocusCarousel.ts    // Arc rotation, pulse timers, carousel hotkeys, URL sync
        ├── components/                // Circular track, perspective card hints, command dock
        └── utils/
            └── arcGeometry.ts         // Bezier arc coordinates for circular track
```

### 4.2 State Decomposition

1. **Headless Domain Hook ([`useReviewData.ts`](/src/features/review/core/hooks/useReviewData.ts))**:
   Manages the candidate queue, mutations (`keep`, `flag`, `pass`), review statistics, and query filter groupings. Contains zero DOM event listeners, layout indices, or animation state.
2. **Queue View Controller ([`useQueueView.ts`](/src/features/review/views/queue/hooks/useQueueView.ts))**:
   Wraps domain state with active item index, tab selection, and list-specific keyboard shortcuts.
3. **Carousel View Controller ([`useFocusCarousel.ts`](/src/features/review/views/focus/hooks/useFocusCarousel.ts))**:
   Wraps domain state with circular arc radians, pulse timers, carousel hotkeys, and URL query synchronization.

### 4.3 Slot-Based Composition

Rather than branching internally on view mode, [`CandidateCard.tsx`](/src/features/review/core/components/card/CandidateCard.tsx) accepts action slots:
* `headerActionSlot?: React.ReactNode`: Renders inline triage buttons in the Queue view.
* `footerActionSlot?: React.ReactNode`: Renders custom footer controls where needed.
* In the Focus view, `hideActionButtons={true}` hides inline buttons because decisions are triggered from the floating dock.

---

## 5. Consequences

### Positive Consequences
* **View Independence**: The Queue view and Focus view can be redesigned, modified, or removed without impacting each other.
* **Clean Bundle Splitting**: Next.js compiles `/review` and `/review/focus` into separate client chunks. 3D arc math and carousel graphics are excluded from the linear queue route.
* **Testable Domain State**: Candidate mutation handling, sorting, and stats calculation live in pure functions and a headless hook, decoupled from UI rendering.

### Trade-offs & Mitigations
* **Structured Import Paths**: Requires developers to respect the boundary rule: views may import from `core/`, but `views/queue` and `views/focus` cannot import from each other.

