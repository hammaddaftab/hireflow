/**
 * Configuration mapping Section 3 items to their originating message indices.
 */
const SECTION_CONFIG_TO_3 = {
  heading: "3. Product Principles & Unit Economics",
  subsections: [
    {
      subheading: "Descriptive vs. Terminal Philosophy:",
      items: [
        {
          statement: 'Systems assigning terminal tags ("Accepted" / "Rejected") induce a "black-box trust deficit," forcing recruiters to manually audit all resumes.',
          assistantIndices: [47]
        },
        {
          statement: 'HireFlow preserves recruiter agency by summarizing candidate evidence across explicit axes without issuing automated rejections.',
          assistantIndices: [49]
        }
      ]
    },
    {
      subheading: "Scope Discipline (Hackathon Triage):",
      items: [
        {
          statement: "Cut: Plugin marketplaces, author monetization frameworks, complex event-sourced timeline mutation, and OCR/image parsing edge cases.",
          assistantIndices: [29, 47, 57]
        },
        {
          statement: "(Explicit Note: The Preserved subheading—covering evidence-grounded shortlisting, requirement-coverage grids, verified quote citations, and duplicate matching—has been fully ignored per your instruction.)",
          isNote: true
        }
      ]
    }
  ]
};
// 43 and 63


// 71
/**
 * Configuration mapping Layer 4 items to their originating assistant message indices.
 */
const SECTION_CONFIG_4 = {
  heading: "4. Data Models, Extraction Schemas, and Processing Pipeline",
  subsections: [
    {
      subheading: "1. Two-Layer Query & Execution Pipeline",
      items: [
        {
          statement: "Layer 1 Process: Resumes are parsed once into a standardized, job-agnostic JSON profile, decoupling document ingestion from downstream job queries.",
          assistantIndices: [75, 79]
        },
        {
          statement: "Layer 1 Payload Compression: Raw resumes (~800–1,500 tokens) compress to compact structured profiles (~150–400 tokens), yielding a 3–5× payload reduction.",
          assistantIndices: [77]
        },
        {
          statement: "(Explicit Note: Cache Key Integrity under Layer 1 has been ignored per instruction.)",
          isNote: true
        },
        {
          statement: "Layer 2 Deterministic Path: Hard constraints (e.g., domain years ≥ threshold, exact location) are evaluated via plain deterministic code with zero LLM API overhead.",
          assistantIndices: [75]
        },
        {
          statement: "Layer 2 Semantic Batched Path: Free-text grouping queries and subjective criteria are processed by batching 50–100 compact profiles per LLM call.",
          assistantIndices: [77]
        }
      ]
    },
    {
      subheading: "2. Universal Evidence Status Taxonomy",
      items: [
        {
          statement: "Fixed Epistemic Taxonomy (_shared/evidence_status.md): Universal 6-state model rejecting custom groupings. Content states: confirmed, inferred, contradicted, not_stated, ambiguous. System state: unparseable.",
          assistantIndices: [73]
        }
      ]
    },
    {
      subheading: "4. Schema Specifications & Structural Rules",
      items: [
        {
          statement: "Job Schema (job/requirements.md): Requirements maintain a single configuration axis (blocking: true | false), defaulting to blocking via an explicit toggle control, with logistics dealbreakers marked blocking by default.",
          assistantIndices: [65, 71, 73]
        },
        {
          statement: "Candidate Work History (candidate/work_history.md): Requires discrete entries with employment_type, verbatim raw_description, and domain-specific tenure computed downstream rather than stored as a static scalar.",
          assistantIndices: [65, 79]
        },
        {
          statement: "Logistics Isolation (candidate/logistics.md): Fields default strictly to not_stated unless literally stated; automated inferences from contextual clues are prohibited.",
          assistantIndices: [57, 65, 79]
        }
      ]
    },
    {
      subheading: "5. Skill Taxonomy & Relational Delta Engine",
      items: [
        {
          statement: "skills_demonstrated Syntactic Classification: Enforces ownership via grammatical subject; categorized into Tier 1 (Action-Attributed → confirmed), Tier 2 (Peripheral-Action → ambiguous), and Tier 3 (Context-Listed → ambiguous).",
          assistantIndices: [81]
        },
        {
          statement: "Decision-Grade Properties & Adversarial Stopping Rule: Requires outcome attachment and concrete-noun density; build scope terminates at Tier 1 + Outcome Attachment, explicitly rejecting composite authenticity scores.",
          assistantIndices: [85, 87]
        },
        {
          statement: "skills_declared Relational Engine: Carries zero standalone evaluation value; utility exists solely in computing the delta against demonstrated history (corroborated, orphan, stale, density anomaly).",
          assistantIndices: [83]
        }
      ]
    }
  ]
};

const SECTION_CONFIG_5 = {
  heading: "5. User Interface",
  subsections: [
    {
      subheading: 'this_heading_exists_for_consistency',
      items: [
        {
          statement: "How the UI will look like",
          assistantIndices: [95]
        },
      ]
    }
  ]
};

export const sections = [SECTION_CONFIG_TO_3, SECTION_CONFIG_4, SECTION_CONFIG_5]
