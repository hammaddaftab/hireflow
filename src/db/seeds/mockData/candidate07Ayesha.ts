// Demo Candidate 7: Logistics-silent (Ayesha Malik)
// Strong confirmed skills, no salary, notice period, relocation, or city stated. Populates Unspecified bucket.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate07Ayesha: ParsedCandidateProfile = {
  id: "cand_ayesha_silent",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:35:00.000Z",
  updated_at: "2026-10-11T09:35:00.000Z",
  source_document: {
    filename: "ayesha_malik_resume.pdf",
    file_size_bytes: 16800,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/ayesha_malik_resume.pdf",
  },
  identity: {
    name: "Ayesha Malik",
    email: "ayesha.malik.dev@gmail.com",
    phone: "+923124491823",
    cnic: null,
    location: {
      raw: null,
      normalized: null,
    },
    links: [
      {
        address: "https://github.com/ayeshamalik-go",
        platform: { raw: "GitHub", normalized: "github" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "Dubizzle Labs",
        title: "Senior Backend Engineer",
        start_date: "2023-02",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Built distributed search indexing microservices in Go handling 22,000 requests/sec with sub-20ms p99 response times. Designed complex PostgreSQL schemas with connection pooling and automated query indexing for 30M user records. Containerized backend services using Docker and implemented enterprise REST API services. Managed production services across Linux container instances.",
      },
      {
        entry_id: "work_2",
        employer: "VentureDive",
        title: "Backend Engineer",
        start_date: "2020-07",
        end_date: "2023-01",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Developed Go microservices and transactional database schemas in PostgreSQL for logistics and delivery workflows. Built customer-facing REST API endpoints containerized with Docker and administered Linux environments.",
      },
    ],
  },
  education: {
    entries: [
      {
        institution: {
          raw: "Accredited University",
          normalized: null,
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
        skill: "Go",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "handling 22,000 requests/sec with sub-20ms p99 response times",
        concrete_noun_present: true,
        evidence_span:
          "Built distributed search indexing microservices in Go handling 22,000 requests/sec with sub-20ms p99 response times.",
        evidence_status: "confirmed",
      },
      {
        skill: "PostgreSQL",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "for 30M user records",
        concrete_noun_present: true,
        evidence_span:
          "Designed complex PostgreSQL schemas with connection pooling and automated query indexing for 30M user records.",
        evidence_status: "confirmed",
      },
      {
        skill: "Docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Containerized backend services using Docker and implemented enterprise REST API services.",
        evidence_status: "confirmed",
      },
      {
        skill: "REST API",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Containerized backend services using Docker and implemented enterprise REST API services.",
        evidence_status: "confirmed",
      },
      {
        skill: "Linux",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Managed production services across Linux container instances.",
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
      raw: null,
      normalized: null,
    },
    notice_period: {
      raw: null,
      normalized: null,
    },
    stated_relocation_willingness: "not_stated",
    stated_availability: "not_stated",
    languages: ["English", "Urdu"],
  },
  role_claims: { claims: [] },
  notable_signals: { signals: [] },
  extraction_metadata: {
    file_hash: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:35:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/ayesha_malik_resume.pdf",
    warnings: ["No municipality stated", "No compensation expectation stated", "No notice duration stated"],
  },
};
