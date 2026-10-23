// Demo Candidate 2: Hidden gem (Hamza Naveed)
// Terse, no tidy skills section, writes Golang, Postgres, RESTful APIs, Amazon Web Services. Fast-clear.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate02Hamza: ParsedCandidateProfile = {
  id: "cand_hamza_gem",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:55:00.000Z",
  updated_at: "2026-10-11T09:55:00.000Z",
  source_document: {
    filename: "hamza_naveed_resume.pdf",
    file_size_bytes: 13422,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/hamza_naveed_resume.pdf",
  },
  identity: {
    name: "Hamza Naveed",
    email: "h.naveed.swe@gmail.com",
    phone: "+923334821950",
    cnic: "35202-7910482-3",
    location: {
      raw: "Model Town, Lahore, Pakistan",
      normalized: {
        city: "Lahore",
        province: "Punjab",
      },
    },
    links: [
      {
        address: "https://github.com/hnaveed-backend",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/hamza-naveed-swe",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "Systems Limited",
        title: "Senior Software Engineer",
        start_date: "2022-03",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Engineered asynchronous ledger dispatch engines in Golang processing 35,000 transaction events per minute with sub-25ms response overhead. Refactored high-concurrency Postgres storage clusters, tuning connection pools and vacuum policies to reduce CPU throttling by 40%. Containerized distributed worker processes using Docker, decreasing cold start spin-up times by 55% across production pods. Constructed secure RESTful APIs for enterprise integration, scaling partner data synchronization throughput by 3.5x. Orchestrated cloud infrastructure and serverless workloads across Amazon Web Services to guarantee high service reliability.",
      },
      {
        entry_id: "work_2",
        employer: "VentureDive",
        title: "Software Engineer",
        start_date: "2020-07",
        end_date: "2022-02",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Implemented core backend data processing services using Golang and Postgres, reducing batch job runtimes by 48%. Built standardized RESTful APIs in Docker environments, maintaining 99.95% service uptime across client-facing endpoints. Streamlined automated build validations on Linux virtual machines to prevent deployment regressions.",
      },
    ],
  },
  education: {
    entries: [
      {
        institution: {
          raw: "FAST National University of Computer and Emerging Sciences, Lahore, Pakistan",
          normalized: "FAST - National University of Computer and Emerging Sciences (NUCES)",
        },
        degree_level: {
          raw: "Bachelor of Science in Computer Science",
          normalized: "bachelors",
        },
        field: {
          raw: "Computer Science",
          normalized: "Computer Science",
        },
        start_date: "2016",
        end_date: "2020",
        is_current: false,
        grade: null,
      },
    ],
  },
  skills_demonstrated: {
    skills: [
      {
        skill: "go",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "sub-25ms response overhead",
        concrete_noun_present: true,
        evidence_span:
          "Engineered asynchronous ledger dispatch engines in Golang processing 35,000 transaction events per minute with sub-25ms response overhead.",
        evidence_status: "confirmed",
      },
      {
        skill: "postgresql",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "reduce CPU throttling by 40%",
        concrete_noun_present: true,
        evidence_span:
          "Refactored high-concurrency Postgres storage clusters, tuning connection pools and vacuum policies to reduce CPU throttling by 40%.",
        evidence_status: "confirmed",
      },
      {
        skill: "docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "decreasing cold start spin-up times by 55%",
        concrete_noun_present: true,
        evidence_span:
          "Containerized distributed worker processes using Docker, decreasing cold start spin-up times by 55% across production pods.",
        evidence_status: "confirmed",
      },
      {
        skill: "rest api",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "scaling partner data synchronization throughput by 3.5x",
        concrete_noun_present: true,
        evidence_span:
          "Constructed secure RESTful APIs for enterprise integration, scaling partner data synchronization throughput by 3.5x.",
        evidence_status: "confirmed",
      },
      {
        skill: "amazon web services",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Orchestrated cloud infrastructure and serverless workloads across Amazon Web Services to guarantee high service reliability.",
        evidence_status: "confirmed",
      },
    ],
  },
  skills_declared: {
    skills_declared: [],
  },
  logistics: {
    salary_expectation: {
      raw: "PKR 360,000 / month",
      normalized: {
        min: 360000,
        max: 360000,
        currency: "PKR",
      },
    },
    notice_period: {
      raw: "15 days",
      normalized: {
        value: 15,
        unit: "days",
      },
    },
    stated_relocation_willingness: "willing",
    stated_availability: "available",
    languages: ["English", "Urdu"],
  },
  role_claims: {
    claims: [
      {
        claim_id: "c1",
        source_entry_ref: "work_1",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Golang", syntactic_tier: "action_attributed", canonical_skill: "go" },
        ],
        raw_nouns: [],
        compact_action: "engineered asynchronous ledger dispatch engines",
        outcome_attached: "35k events/min, <25ms overhead",
        evidence_span:
          "Engineered asynchronous ledger dispatch engines in Golang processing 35,000 transaction events per minute with sub-25ms response overhead.",
      },
      {
        claim_id: "c2",
        source_entry_ref: "work_1",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Postgres", syntactic_tier: "action_attributed", canonical_skill: "postgresql" },
        ],
        raw_nouns: ["connection pools", "vacuum policies"],
        compact_action: "refactored high-concurrency storage clusters",
        outcome_attached: "-40% CPU throttling",
        evidence_span:
          "Refactored high-concurrency Postgres storage clusters, tuning connection pools and vacuum policies to reduce CPU throttling by 40%.",
      },
      {
        claim_id: "c3",
        source_entry_ref: "work_1",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Docker", syntactic_tier: "action_attributed", canonical_skill: "docker" },
          { skill: "RESTful APIs", syntactic_tier: "action_attributed", canonical_skill: "rest api" },
          { skill: "AWS", syntactic_tier: "action_attributed", canonical_skill: "amazon web services" },
        ],
        raw_nouns: [],
        compact_action: "containerized worker pods and built enterprise sync APIs",
        outcome_attached: "-55% cold start, 3.5x sync throughput",
        evidence_span:
          "Containerized distributed worker processes using Docker, decreasing cold start spin-up times by 55% across production pods. Constructed secure RESTful APIs for enterprise integration, scaling partner data synchronization throughput by 3.5x.",
      },
      {
        claim_id: "c4",
        source_entry_ref: "work_2",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Golang", syntactic_tier: "action_attributed", canonical_skill: "go" },
          { skill: "Postgres", syntactic_tier: "action_attributed", canonical_skill: "postgresql" },
          { skill: "Docker", syntactic_tier: "action_attributed", canonical_skill: "docker" },
        ],
        raw_nouns: [],
        compact_action: "implemented backend batch processing services",
        outcome_attached: "-48% batch runtime, 99.95% uptime",
        evidence_span:
          "Implemented core backend data processing services using Golang and Postgres, reducing batch job runtimes by 48%. Built standardized RESTful APIs in Docker environments, maintaining 99.95% service uptime across client-facing endpoints.",
      },
    ],
  },
  notable_signals: { signals: [] },
  extraction_metadata: {
    file_hash: "42bf2b51b7baedecab75b74cd41b0586d944837b6c0cae4c3f829857f833e634",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:05:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/hamza_naveed_resume.pdf",
    warnings: [],
  },
};
