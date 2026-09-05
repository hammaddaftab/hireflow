# Evaluation & Extraction Status Taxonomy

## Evaluation-Time Requirement Statuses (Job vs Candidate Matching)

| Requirement Category | Confined Statuses | Condition / Trigger |
| :--- | :--- | :--- |
| **Experience** | `confirmed` | Verified full-time years meet or exceed threshold (`verifiedYears >= minYears`). |
| | `contradicted` | Verified full-time years are below required threshold (`verifiedYears < minYears`). |
| | `not_stated` | Candidate profile has zero work history entries. |
| **Technical Skills** | `confirmed` | Corroborated with action verbs in `skills_demonstrated`. |
| | `ambiguous` | Declared in `skills_declared` (resume skills list) without work-history corroboration (orphan claim), or extraction evidence was peripheral. |
| | `not_stated` | Skill is never mentioned anywhere in the resume. |
| **Education** | `confirmed` | Completed degree tier meets or exceeds required rank (e.g. Bachelors or Masters). |
| | `ambiguous` | Candidate is currently enrolled / degree is in-progress (`is_current: true`). |
| | `contradicted` | Completed degree tier is lower than required (e.g. High School when Bachelors required). |
| | `not_stated` | Candidate has no educational degree listed. |
| **Compensation** | `confirmed` | Stated expectation falls within the job budget. |
| | `contradicted` | Candidate minimum expectation exceeds the budget ceiling (`normMin > band.max`). |
| | `ambiguous` | Candidate maximum expectation is below the budget floor (`normMax < band.min`). |
| | `not_stated` | Candidate omitted salary expectation. |
| **Notice Period** | `confirmed` | Candidate notice period in days is within allowed ceiling (`candDays <= maxDays`). |
| | `contradicted` | Candidate notice period exceeds allowed ceiling (`candDays > maxDays`). |
| | `not_stated` | Candidate omitted notice period. |
| **Work Mode & Location** | `confirmed` | Location matches, or candidate stated willing to relocate, or role is remote. |
| | `contradicted` | Location mismatch and candidate stated unwilling to relocate for an onsite/hybrid role. |
| | `ambiguous` | Relocation willingness or availability is unstated for non-remote roles. |

---

## Extraction-Time Aspect Statuses (Resume Parsing)

| Extracted Aspect | Confined Statuses | Condition / Trigger |
| :--- | :--- | :--- |
| **Skills Demonstrated** | `confirmed` | Syntactic tier is `action_attributed` (candidate is grammatical subject of verb denoting doing/building). |
| | `ambiguous` | Syntactic tier is `peripheral_action` (passive exposure) or `context_listed` (tools list without verb). |
| **Employment Type** | `confirmed` | Explicitly stated in resume text ("Full-time", "Contract", "Internship"). |
| | `inferred` | Deduced from title (e.g. "Software Intern") or defaulted to full-time. |
| **Logistics** | Stated value / `not_stated` | Strict extraction rule: never infer. Stated values are normalized; unstated fields are `null` / `"not_stated"`. |

