# Plan Step 2: Unified Job Creation UI Architecture

* **Scope**: Form Simplification, Skill Autocomplete, Right Sidebar Toggles, and Uniform Validation
* **Target Directory**: `src/features/jobs/NewJob/`, `src/components/ui/`, `src/data/`
* **Single-Pass Execution**: Every UI component is modified once with all features integrated simultaneously, avoiding rework.

---

## 1. Overview & Strategy

With the matching engine and evaluator contracts finalized in Step 1, the entire job creation interface can be built in a single unified pass:
* Step 1 (Role Identity) is stripped down to bare administrative essentials (**Job Title** and **Department**).
* Step 2 (Screening Criteria) gains an **Active Criteria Checklist Sidebar** on the right.
* Unchecked requirements dim into a dull disabled state and are omitted from candidate evaluation.
* Active requirements are enforced with uniform frontend validation.
* Skill inputs transition from plain text boxes to an interactive chip input with client-side autocomplete.

---

## 2. Issues & Exact Implementation Plan

### Issue 1: Slim Down Role Identity Form (Zero DB Schema Changes)
* **Files to Modify**:
  * `src/features/jobs/NewJob/components/RoleIdentityForm.tsx`
  * `src/features/jobs/NewJob/NewJobPage.tsx`
* **Problem**: `Seniority Level` and `Role Summary` have no analytical responsibility in candidate evaluation. However, `jobs.description` has a database `NOT NULL` constraint and a Zod `.min(10)` validator.
* **How to Achieve It**:
  1. In `RoleIdentityForm.tsx`:
     * Remove the `Seniority Level` select dropdown and `Role Summary` text input.
     * Keep only `Job Title` and `Department`.
     * Update the description banner to: `"Administrative details for dashboard display and organization."`
  2. In `NewJobPage.tsx`:
     * Pass `seniority_level: null`.
     * Auto-generate a minimal fallback description:
       ```typescript
       description: `Requirements specification for ${title.trim()} (${department.trim()})`,
       ```
       (Guaranteed $\ge 10$ characters; satisfies DB and Zod schema without migration).
     * Add single-line comment in both files:
       ```typescript
       // TODO: Schema simplification - deprecate seniority_level and description columns from jobs schema
       ```

---

### Issue 2: Static Canonical Skills Data Store
* **File to Create**: `src/data/skills_canonical.json`
* **Purpose**: Provide a fast, zero-network, in-browser reference list for skill chip autocomplete.
* **How to Achieve It**:
  * Create a static JSON array containing ~350 widely used programming languages, frontend/backend frameworks, databases, cloud providers, and DevOps tools:
    * Languages: TypeScript, JavaScript, Python, Go, Java, C++, C#, Rust, PHP, Ruby, Swift, Kotlin, SQL, etc.
    * Frontend: React, Next.js, Vue, Angular, Svelte, Tailwind CSS, Redux, HTML5, CSS3, etc.
    * Backend: Node.js, Express, NestJS, FastAPI, Django, Spring Boot, ASP.NET, Ruby on Rails, etc.
    * Databases: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, SQLite, DynamoDB, Cassandra, etc.
    * Cloud & DevOps: AWS, Azure, Google Cloud Platform, Docker, Kubernetes, Terraform, CI/CD, Linux, Git, etc.

---

### Issue 3: Client-Side Skill Chip Autocomplete Component
* **File to Create**: `src/components/ui/SkillChipInput.tsx`
* **File to Modify**: `src/features/jobs/NewJob/components/ScreeningCriteria/RequirementField.tsx`
* **Problem**: Entering comma-separated skills in a plain text input allows spelling errors, typos, and formatting mistakes that cause mismatch friction.
* **How to Achieve It**:
  1. Create `SkillChipInput.tsx`:
     * Manages a list of string chips (`value: string[]`, `onChange: (chips: string[]) => void`).
     * Debounces keystrokes (~150ms).
     * **Call Site 1 Filtering**: Runs fast client-side prefix/substring search against `skills_canonical.json`.
     * **Typo Tolerance Fallback**: If substring search returns zero hits, runs Levenshtein distance $\le 2$ edit distance to suggest corrected spellings (e.g. `"Pyhton"` $\to$ `"Python"`).
     * Keyboard interactions:
       * `Enter` or `Comma` commits the typed text as a chip.
       * `Backspace` on an empty input removes the last chip.
       * Clicking the `X` button on a chip removes it.
     * Click on a dropdown suggestion instantly adds the canonical skill chip.
  2. In `RequirementField.tsx`:
     * When `field.id === "skillsRequired"` or `field.id === "skillsPreferred"`, render `SkillChipInput` instead of `<input type="text">`.

---

### Issue 4: Screening Criteria Data & Currency Restriction
* **File to Modify**: `src/features/jobs/NewJob/components/ScreeningCriteria/requirementsData.ts`
* **How to Achieve It**:
  1. Remove `EUR` and `GBP` from `compensationCurrency.options`:
     ```typescript
     compensationCurrency: {
       id: "compensationCurrency",
       label: "Compensation Currency",
       helperText: "Currency unit for compensation band",
       mode: "soft",
       value: "PKR",
       options: ["PKR", "USD"],
     },
     ```
  2. Add `enabled: boolean` (default `true`) to all fields in `initialRequirementsFields`.

---

### Issue 5: Right Sidebar Checklist & Dull/Disabled Styling
* **Files to Modify**:
  * `src/features/jobs/NewJob/components/ScreeningCriteria/ScreeningCriteriaForm.tsx`
  * `src/features/jobs/NewJob/components/ScreeningCriteria/RequirementField.tsx`
* **How to Achieve It**:
  1. In `ScreeningCriteriaForm.tsx`:
     * Introduce a 2-column layout:
       * **Left Area (w-full lg:w-3/4)**: The criteria form groups.
       * **Right Sidebar (w-full lg:w-1/4, sticky top-6)**: "Criteria Selection Sidebar".
     * Right sidebar renders a card with checkboxes for each requirement:
       1. Minimum Experience
       2. Mandatory Skills (Knockout)
       3. Preferred Skills (Bonus)
       4. Minimum Degree Level
       5. Field of Study
       6. Location (City & Province)
       7. Workplace Mode
       8. Compensation Band
       9. Notice Period
     * Provide `onToggleEnabled: (id: string) => void`.
  2. In `RequirementField.tsx`:
     * Accept `enabled: boolean`.
     * When `enabled === false`:
       * Apply dull disabled styling: `opacity-40 grayscale-[20%] pointer-events-none select-none bg-surface-container/30 rounded-lg p-3 transition-all`.
       * Disable all inner inputs, selects, and toggle buttons.
       * Render a subtle indicator badge: `"Excluded from criteria"`.

---

### Issue 6: Direct Uniform Validation & Payload Serialization
* **File to Modify**: `src/features/jobs/NewJob/NewJobPage.tsx`
* **How to Achieve It**:
  1. **Uniform Validation on Submit**:
     * Before creating the job, iterate over all enabled fields:
       * `minExperience`: must have numeric value $\ge 0$.
       * `skillsRequired`: must have at least 1 skill chip.
       * `skillsPreferred`: must have at least 1 skill chip.
       * `degreeLevel`: must have a selected tier (if enabled).
       * `fieldOfStudy`: must not be blank.
       * `locationCity` / `locationProvince`: must not be blank.
       * `workMode`: must have selected mode.
       * `compensationMin` / `compensationMax`: must have valid numeric bounds.
       * `noticePeriod`: must have valid numeric amount.
     * If any active requirement is missing or blank:
       * Abort submission.
       * Show alert: `"Please provide a value for [Field Label], or disable it in the criteria sidebar."`
  2. **Clean Payload Serialization**:
     * For any disabled criteria, pass `undefined` or `null`:
       * Disabled `minExperience` $\to$ `min_experience: undefined`
       * Disabled `skillsRequired` $\to$ `skills_required: []`
       * Disabled `skillsPreferred` $\to$ `skills_preferred: []`
       * Disabled `degreeLevel` / `fieldOfStudy` $\to$ `education_min: undefined`
       * Disabled `locationCity` / `locationProvince` $\to$ `location_requirement: undefined`
       * Disabled `workMode` $\to$ `work_mode: undefined`
       * Disabled `compensation` $\to$ `compensation_band: undefined`
       * Disabled `noticePeriod` $\to$ `max_notice_period: undefined`
     * Evaluators in `reviewQueueService.ts` will safely bypass undefined requirements.

---

## 3. Order of Execution for Step 2

1. Create `src/data/skills_canonical.json`.
2. Create `src/components/ui/SkillChipInput.tsx`.
3. Update `RoleIdentityForm.tsx` to remove Seniority and Role Summary.
4. Update `requirementsData.ts` (PKR/USD currencies + enabled state).
5. Update `RequirementField.tsx` (SkillChipInput integration + dull disabled styling).
6. Update `ScreeningCriteriaForm.tsx` (Right sidebar checklist layout).
7. Update `NewJobPage.tsx` (Uniform validation + payload serialization of enabled criteria).
