# Geographic Taxonomy: Provinces vs. Federal Capital Territory

This document establishes the canonical geographic taxonomy for Pakistan used throughout HireFlow, detailing the distinction between provincial jurisdictions and federal capital territory, and how they are visualized across the user interface.

---

## 1. Constitutional & Administrative Distinction

In Pakistan's administrative framework:
* **The Four Provinces**: **Punjab**, **Sindh**, **Khyber Pakhtunkhwa (KP)**, and **Balochistan**. Each province is a distinct federating unit with provincial assemblies, ministries, and administrative boundaries.
* **Federal Capital Territory**: **Islamabad** is **not** a province and does not belong to Punjab or any other province. Under Article 1 of the Constitution of Pakistan, it is designated as the **Islamabad Capital Territory (ICT)**, an autonomous federal district administered directly by the federal government.

---

## 2. Data Model & Schema Representation

In [`/src/entities/extraction/candidate/aspects/identity.ts`](/src/entities/extraction/candidate/aspects/identity.ts):

```typescript
export const NormalizedLocationSchema = z.object({
  raw: z
    .string()
    .nullable()
    .describe("Raw candidate location or city as explicitly stated in the document, else null"),
  normalized: z
    .object({
      city: z.string().nullable(),
      province: z.string().nullable(),
    })
    .nullable(),
});
```

### Canonical Value Rules
1. **Field Name `province`**: To maintain a compact schema across the database (`candidates.province`), candidate extraction aspects, and job requirements (`requirements.province`), the single string field `province` serves as the container for regional/sub-national administrative divisions (both provinces and federal territories).
2. **Islamabad Values**:
   - `city`: Always `"Islamabad"`
   - `province`: Strictly `"Islamabad Capital Territory"`
   - *Prohibited legacy values*: `"Federal"`, `"ICT"` (as province), or leaving `province` null when the city is known.
3. **Provincial Values**:
   - Lahore, Rawalpindi, Faisalabad, Multan, Sialkot, Gujranwala -> `province: "Punjab"`
   - Karachi, Hyderabad -> `province: "Sindh"`
   - Peshawar -> `province: "Khyber Pakhtunkhwa"`
   - Quetta -> `province: "Balochistan"`
4. **Unspecified / Remote Values**:
   - Verbatim mentions like `"Anywhere in Pakistan"`, `"Fully Remote"`, `"Open to Travel"`, or country-only entries with no specific municipality -> `city: null`, `province: null`.

---

## 3. Normalization Pipeline

The centralized normalizer is located at [`/src/features/extraction/locationNormalizer.ts`](/src/features/extraction/locationNormalizer.ts):

```typescript
export const CITY_PROVINCE_MAP: Record<string, string> = {
  islamabad: "Islamabad Capital Territory",
  lahore: "Punjab",
  rawalpindi: "Punjab",
  karachi: "Sindh",
  faisalabad: "Punjab",
  multan: "Punjab",
  peshawar: "Khyber Pakhtunkhwa",
  quetta: "Balochistan",
  sialkot: "Punjab",
  gujranwala: "Punjab",
};
```

### Alias and Sector Resolution:
* **Islamabad**: Resolves `"Islamabad, Pakistan"`, `"ISB"`, `"ICT"`, and CDA sectors (`"G-13/2"`, `"F-10"`, `"E-11"`, `"H-12"`) to:
  - `city: "Islamabad"`
  - `province: "Islamabad Capital Territory"`
* **Lahore**: Resolves `"Lahore"`, `"LHR"`, `"Gulberg"`, `"Model Town"` to:
  - `city: "Lahore"`
  - `province: "Punjab"`
* **Karachi**: Resolves `"Karachi"`, `"KHI"`, `"Clifton"`, `"Korangi"` to:
  - `city: "Karachi"`
  - `province: "Sindh"`
* **Rawalpindi**: Resolves `"Rawalpindi"`, `"Pindi"`, `"Satellite Town"` to:
  - `city: "Rawalpindi"`
  - `province: "Punjab"`

---

## 4. UI Representation

The distinction between provinces, federal capital territory, and unresolvable locations is presented in three distinct areas of the UI:

### 1. Review Queue Filter Pane ([`/src/features/review/views/focus/components/ReviewFilterPane.tsx`](/src/features/review/views/focus/components/ReviewFilterPane.tsx))
Candidates are aggregated into count-sorted menu items based on their location status:
* **Canonical City Entries**: Sorted descending by count (e.g. `Islamabad (4)`, `Lahore (2)`, `Karachi (2)`, `Rawalpindi (1)`).
* **`Need Attention`**: Raw address exists in resume text but could not be resolved to a known city.
* **`Unspecified`**: Candidate has no location stated at all (or is purely remote).

### 2. Candidate Review Cards ([`/src/features/review/core/components/card/CandidateCard.tsx`](/src/features/review/core/components/card/CandidateCard.tsx))
* Rendered adjacent to the candidate metadata: `[City], [Province/Territory]` (e.g., `Islamabad, Islamabad Capital Territory` or `Lahore, Punjab`).
* If normalization failed, displays the verbatim raw location string with an indicator for manual review.

### 3. AI Testing Workbench ([`/src/features/evals/components/identity/IdentityTestingWorkbench.tsx`](/src/features/evals/components/identity/IdentityTestingWorkbench.tsx))
In the **Identity Aspect** testing workbench, the **Geographic Normalization Card** explicitly visualizes:
1. **Raw Stated Address**: The verbatim string extracted from the document header.
2. **Canonical City**: Resolved canonical city name (e.g., `Islamabad`).
3. **Province / State**: Canonical province/territory string (e.g., `Islamabad Capital Territory`).
4. **Territory Jurisdiction Badge**:
   - `Federal Capital Territory (ICT)` (amber badge) for Islamabad.
   - `Punjab Province` / `Sindh Province` (primary badge) for provincial jurisdictions.
   - `Unspecified Location` (neutral badge) for remote/omitted cases.
5. **Queue Filter Bucket**: Displays which filter bucket the candidate will populate (`Islamabad`, `Need Attention`, or `Unspecified`).

---

## 5. Summary Reference Matrix

| Stated Address in Resume | Resolved City | Resolved Province | Territory Jurisdiction Badge in UI | Queue Filter Bucket |
| :--- | :--- | :--- | :--- | :--- |
| `Street 8, Sector G-13/2, Islamabad (ISB), Pakistan` | `Islamabad` | `Islamabad Capital Territory` | `Federal Capital Territory (ICT)` | `Islamabad` |
| `F-10 Markaz, Islamabad` | `Islamabad` | `Islamabad Capital Territory` | `Federal Capital Territory (ICT)` | `Islamabad` |
| `Lahore, Pakistan` | `Lahore` | `Punjab` | `Punjab Province` | `Lahore` |
| `Clifton Block 2, Karachi` | `Karachi` | `Sindh` | `Sindh Province` | `Karachi` |
| `Satellite Town, Rawalpindi` | `Rawalpindi` | `Punjab` | `Punjab Province` | `Rawalpindi` |
| `Bahria Town, Phase 8` (no city mentioned) | `null` | `null` | `Unspecified Location` | `Need Attention` |
| `Anywhere in Pakistan (Fully Remote)` | `null` | `null` | `Unspecified Location` | `Unspecified` |
| *(Omitted address)* | `null` | `null` | `Unspecified Location` | `Unspecified` |
