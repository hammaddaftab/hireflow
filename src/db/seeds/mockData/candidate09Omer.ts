// Demo Candidate 9: Realistic mixed (Omer Farooq)
// Go & Docker confirmed with outcomes, PostgreSQL peripheral ('worked with'), REST API and AWS orphan (declared only).

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate09Omer: ParsedCandidateProfile = {
  id: "cand_omer_mixed",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:25:00.000Z",
  updated_at: "2026-10-11T09:25:00.000Z",
  source_document: {
    filename: "omer_farooq_resume.pdf",
    file_size_bytes: 17100,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/omer_farooq_resume.pdf",
  },
  identity: {
    name: "Omer Farooq",
    email: "omer.farooq.dev@gmail.com",
    phone: "+923455192830",
    cnic: "37405-1829401-9",
    location: {
      raw: "Sector G-11/2, Islamabad, Pakistan",
      normalized: {
        city: "Islamabad",
        province: "Islamabad Capital Territory",
      },
    },
    links: [
      {
        address: "https://github.com/omerfarooq-backend",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/omer-farooq-swe",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "S&P Global",
        title: "Backend Software Engineer",
        start_date: "2023-01",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Engineered financial data streaming microservices in Go handling 14,000 requests/sec with 99.95% uptime, reducing latency by 35%. Containerized services using Docker multi-stage builds. Worked with team database engineers on PostgreSQL tables and query structures for audit logs.",
      },
      {
        entry_id: "work_2",
        employer: "Telenor",
        title: "Software Engineer",
        start_date: "2021-01",
        end_date: "2022-12",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Developed subscriber account management microservices in Go, cutting batch provisioning turnaround times by 40%. Packaged backend tools with Docker containers. Participated in database reviews and assisted with PostgreSQL schema updates on Linux servers.",
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
        start_date: "2016",
        end_date: "2020",
        is_current: false,
        grade: "3.42 CGPA",
      },
    ],
  },
  skills_demonstrated: {
    skills: [
      {
        skill: "Go",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "handling 14,000 requests/sec with 99.95% uptime, reducing latency by 35%",
        concrete_noun_present: true,
        evidence_span:
          "Engineered financial data streaming microservices in Go handling 14,000 requests/sec with 99.95% uptime, reducing latency by 35%.",
        evidence_status: "confirmed",
      },
      {
        skill: "Docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Containerized services using Docker multi-stage builds.",
        evidence_status: "confirmed",
      },
      {
        skill: "PostgreSQL",
        source_entry_ref: "work_1",
        syntactic_tier: "peripheral_action",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Worked with team database engineers on PostgreSQL tables and query structures for audit logs.",
        evidence_status: "ambiguous",
      },
    ],
  },
  skills_declared: {
    skills_declared: [
      "Go",
      "Docker",
      "PostgreSQL",
      "REST API",
      "AWS",
      "Linux",
    ],
  },
  logistics: {
    salary_expectation: {
      raw: "PKR 390,000 / month",
      normalized: {
        min: 390000,
        max: 390000,
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
    file_hash: "e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01234",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:25:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/omer_farooq_resume.pdf",
    warnings: [],
  },
};
