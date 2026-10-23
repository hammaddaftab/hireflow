// Demo Candidate 5: Near-miss (Usman Ali)
// Exactly 3.6 years experience against 4+ requirement with strong evidence. Lands in Contradicted tab.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate05Usman: ParsedCandidateProfile = {
  id: "cand_usman_near_miss",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:40:00.000Z",
  updated_at: "2026-10-11T09:40:00.000Z",
  source_document: {
    filename: "usman_ali_resume.pdf",
    file_size_bytes: 17400,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/usman_ali_resume.pdf",
  },
  identity: {
    name: "Usman Ali",
    email: "usman.ali.golang@gmail.com",
    phone: "+923349182304",
    cnic: "37405-9182301-3",
    location: {
      raw: "Satellite Town, Rawalpindi, Pakistan",
      normalized: {
        city: "Rawalpindi",
        province: "Punjab",
      },
    },
    links: [
      {
        address: "https://github.com/usmanali-go",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/usman-ali-dev",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "10Pearls",
        title: "Backend Engineer",
        start_date: "2023-03",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Engineered high-throughput order dispatch microservices in Go, sustaining over 12,000 requests per minute with 99.9% uptime. Optimized PostgreSQL relational schemas across 18M audit log records, accelerating query completion by 38%. Containerized backend services with Docker multi-stage builds and automated CI pipelines. Implemented robust REST API endpoints with JWT authentication and idempotency validation. Maintained distributed services across Linux servers.",
      },
      {
        entry_id: "work_2",
        employer: "Shifa Technologies",
        title: "Associate Software Engineer",
        start_date: "2022-03",
        end_date: "2023-02",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Built internal medical record management endpoints in Go interacting with PostgreSQL databases. Packaged services in Docker containers and developed external REST API interfaces on Linux systems.",
      },
    ],
  },
  education: {
    entries: [
      {
        institution: {
          raw: "National University of Sciences and Technology (NUST) (Islamabad, Pakistan)",
          normalized: "National University of Sciences and Technology",
        },
        degree_level: {
          raw: "Bachelor of Science in Computer Science",
          normalized: "bachelors",
        },
        field: {
          raw: "Computer Science",
          normalized: "Computer Science",
        },
        start_date: "2018",
        end_date: "2022",
        is_current: false,
        grade: "3.55 CGPA",
      },
    ],
  },
  skills_demonstrated: {
    skills: [
      {
        skill: "Go",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "sustaining over 12,000 requests per minute with 99.9% uptime",
        concrete_noun_present: true,
        evidence_span:
          "Engineered high-throughput order dispatch microservices in Go, sustaining over 12,000 requests per minute with 99.9% uptime.",
        evidence_status: "confirmed",
      },
      {
        skill: "PostgreSQL",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "accelerating query completion by 38%",
        concrete_noun_present: true,
        evidence_span:
          "Optimized PostgreSQL relational schemas across 18M audit log records, accelerating query completion by 38%.",
        evidence_status: "confirmed",
      },
      {
        skill: "Docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "with Docker multi-stage builds",
        concrete_noun_present: true,
        evidence_span:
          "Containerized backend services with Docker multi-stage builds and automated CI pipelines.",
        evidence_status: "confirmed",
      },
      {
        skill: "REST API",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "with JWT authentication and idempotency validation",
        concrete_noun_present: true,
        evidence_span:
          "Implemented robust REST API endpoints with JWT authentication and idempotency validation.",
        evidence_status: "confirmed",
      },
      {
        skill: "Linux",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Maintained distributed services across Linux servers.",
        evidence_status: "confirmed",
      },
    ],
  },
  skills_declared: {
    skills_declared: [
      "Go",
      "PostgreSQL",
      "Docker",
      "REST API",
      "Linux",
      "Redis",
      "Git",
    ],
  },
  logistics: {
    salary_expectation: {
      raw: "PKR 340,000 / month",
      normalized: {
        min: 340000,
        max: 340000,
        currency: "PKR",
      },
    },
    notice_period: {
      raw: "30 days",
      normalized: {
        value: 30,
        unit: "days",
      },
    },
    stated_relocation_willingness: "willing",
    stated_availability: "available",
    languages: ["English", "Urdu"],
  },
  role_claims: { claims: [] },
  notable_signals: { signals: [] },
  extraction_metadata: {
    file_hash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:40:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/usman_ali_resume.pdf",
    warnings: ["Total experience 3.6 years is below 4-year requirement"],
  },
};
