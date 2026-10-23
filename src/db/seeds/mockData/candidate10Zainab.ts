// Demo Candidate 10: Misses only a preferred skill (Zainab Bibi)
// All 4 blocking required skills confirmed with strong evidence. No Redis. Lands in Fast-clear.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate10Zainab: ParsedCandidateProfile = {
  id: "cand_zainab_misses_pref",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:20:00.000Z",
  updated_at: "2026-10-11T09:20:00.000Z",
  source_document: {
    filename: "zainab_bibi_resume.pdf",
    file_size_bytes: 18500,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/zainab_bibi_resume.pdf",
  },
  identity: {
    name: "Zainab Bibi",
    email: "zainab.bibi.golang@gmail.com",
    phone: "+923028519402",
    cnic: "37405-9281740-4",
    location: {
      raw: "Sector F-10/3, Islamabad, Pakistan",
      normalized: {
        city: "Islamabad",
        province: "Islamabad Capital Territory",
      },
    },
    links: [
      {
        address: "https://github.com/zainabbibi-go",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/zainab-bibi-swe",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "Motive",
        title: "Senior Backend Engineer",
        start_date: "2022-10",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Architected vehicle telemetry dispatch services in Go processing 25,000 requests/sec with 99.99% uptime, reducing end-to-end event latency by 45%. Designed and optimized partitioned PostgreSQL tables indexing 60M GPS telemetry events. Containerized microservice deployments with Docker on Kubernetes Linux nodes. Engineered REST API endpoints and gRPC streaming pipelines.",
      },
      {
        entry_id: "work_2",
        employer: "Teradata",
        title: "Backend Software Engineer",
        start_date: "2020-09",
        end_date: "2022-09",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Developed enterprise data ingestion microservices in Go, maintaining robust transactional integrity across PostgreSQL databases. Built partner-facing REST API gateways containerized with Docker on Linux servers.",
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
        grade: "3.78 CGPA",
      },
    ],
  },
  skills_demonstrated: {
    skills: [
      {
        skill: "Go",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "reducing end-to-end event latency by 45%",
        concrete_noun_present: true,
        evidence_span:
          "Architected vehicle telemetry dispatch services in Go processing 25,000 requests/sec with 99.99% uptime, reducing end-to-end event latency by 45%.",
        evidence_status: "confirmed",
      },
      {
        skill: "PostgreSQL",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "indexing 60M GPS telemetry events",
        concrete_noun_present: true,
        evidence_span:
          "Designed and optimized partitioned PostgreSQL tables indexing 60M GPS telemetry events.",
        evidence_status: "confirmed",
      },
      {
        skill: "Docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Containerized microservice deployments with Docker on Kubernetes Linux nodes.",
        evidence_status: "confirmed",
      },
      {
        skill: "REST API",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Engineered REST API endpoints and gRPC streaming pipelines.",
        evidence_status: "confirmed",
      },
      {
        skill: "Kubernetes",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Containerized microservice deployments with Docker on Kubernetes Linux nodes.",
        evidence_status: "confirmed",
      },
      {
        skill: "Linux",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Containerized microservice deployments with Docker on Kubernetes Linux nodes.",
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
      "Kubernetes",
      "Linux",
      "AWS",
      "Apache Kafka",
      "gRPC",
    ],
  },
  logistics: {
    salary_expectation: {
      raw: "PKR 410,000 / month",
      normalized: {
        min: 410000,
        max: 410000,
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
    file_hash: "f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012345",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:20:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/zainab_bibi_resume.pdf",
    warnings: [],
  },
};
