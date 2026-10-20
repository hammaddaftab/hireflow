// Demo Candidate 8: Great but out of band (Farhan Siddiqui)
// Strong evidence, PKR 600,000 salary, 90-day notice. Two deterministic contradictions. Lands in Contradicted tab.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate08Farhan: ParsedCandidateProfile = {
  id: "cand_farhan_out_of_band",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:30:00.000Z",
  updated_at: "2026-10-11T09:30:00.000Z",
  source_document: {
    filename: "farhan_siddiqui_resume.pdf",
    file_size_bytes: 19100,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/farhan_siddiqui_resume.pdf",
  },
  identity: {
    name: "Farhan Siddiqui",
    email: "farhan.siddiqui.lead@gmail.com",
    phone: "+923008219405",
    cnic: "42101-9281740-1",
    location: {
      raw: "Clifton Block 4, Karachi, Pakistan",
      normalized: {
        city: "Karachi",
        province: "Sindh",
      },
    },
    links: [
      {
        address: "https://github.com/farhansiddiqui-lead",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/farhan-siddiqui-go",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "Careem",
        title: "Lead Backend Engineer",
        start_date: "2022-05",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Led architecture of real-time ride dispatch engines in Go processing 50,000 transactions/min with sub-15ms p99 latency. Re-architected mission-critical PostgreSQL databases with read-replicas across 80M trip records. Deployed containerized microservices via Docker across Linux clusters and authored REST API specifications.",
      },
      {
        entry_id: "work_2",
        employer: "Afiniti",
        title: "Senior Software Engineer",
        start_date: "2018-08",
        end_date: "2022-04",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Built high-concurrency Go services and PostgreSQL data access layers. Packaged microservices in Docker and exposed secure REST API endpoints on Linux servers.",
      },
    ],
  },
  education: {
    entries: [
      {
        institution: {
          raw: "FAST National University of Computer and Emerging Sciences (FAST-NUCES) (Karachi, Pakistan)",
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
        start_date: "2014",
        end_date: "2018",
        is_current: false,
        grade: "3.72 CGPA",
      },
    ],
  },
  skills_demonstrated: {
    skills: [
      {
        skill: "Go",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "processing 50,000 transactions/min with sub-15ms p99 latency",
        concrete_noun_present: true,
        evidence_span:
          "Led architecture of real-time ride dispatch engines in Go processing 50,000 transactions/min with sub-15ms p99 latency.",
        evidence_status: "confirmed",
      },
      {
        skill: "PostgreSQL",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "across 80M trip records",
        concrete_noun_present: true,
        evidence_span:
          "Re-architected mission-critical PostgreSQL databases with read-replicas across 80M trip records.",
        evidence_status: "confirmed",
      },
      {
        skill: "Docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Deployed containerized microservices via Docker across Linux clusters and authored REST API specifications.",
        evidence_status: "confirmed",
      },
      {
        skill: "REST API",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Deployed containerized microservices via Docker across Linux clusters and authored REST API specifications.",
        evidence_status: "confirmed",
      },
      {
        skill: "Linux",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Deployed containerized microservices via Docker across Linux clusters and authored REST API specifications.",
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
      "Kubernetes",
      "gRPC",
      "Git",
    ],
  },
  logistics: {
    salary_expectation: {
      raw: "PKR 600,000 / month",
      normalized: {
        min: 600000,
        max: 600000,
        currency: "PKR",
      },
    },
    notice_period: {
      raw: "90 days",
      normalized: {
        value: 90,
        unit: "days",
      },
    },
    stated_relocation_willingness: "willing",
    stated_availability: "available",
    languages: ["English", "Urdu"],
  },
  extraction_metadata: {
    file_hash: "d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:30:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/farhan_siddiqui_resume.pdf",
    warnings: [
      "Salary expectation PKR 600,000 exceeds upper band",
      "Notice period 90 days exceeds maximum policy",
    ],
  },
};
