// Demo Candidate 4: Adjacent stack (Bilal Ahmed)
// Strong 5-year Java engineer with no JavaScript or Node anywhere. Tests no false matches against Go.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate04Bilal: ParsedCandidateProfile = {
  id: "cand_bilal_adjacent",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:45:00.000Z",
  updated_at: "2026-10-11T09:45:00.000Z",
  source_document: {
    filename: "bilal_ahmed_resume.pdf",
    file_size_bytes: 18200,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/bilal_ahmed_resume.pdf",
  },
  identity: {
    name: "Bilal Ahmed",
    email: "bilal.ahmed.java@gmail.com",
    phone: "+923227182940",
    cnic: "35202-8192041-5",
    location: {
      raw: "Gulberg III, Lahore, Pakistan",
      normalized: {
        city: "Lahore",
        province: "Punjab",
      },
    },
    links: [
      {
        address: "https://github.com/bilalahmed-backend",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/bilal-ahmed-java",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "NetSol Technologies",
        title: "Senior Software Engineer",
        start_date: "2022-03",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Architected enterprise billing and payment settlement microservices in Java 17 and Spring Boot, processing over PKR 95M in monthly transactions. Designed and optimized relational PostgreSQL schemas across 28M transactional records. Packaged applications into Docker containers and automated CI/CD builds for rapid testing cycles. Developed secure, high-throughput REST API endpoints incorporating token-based authentication. Operated backend microservices on Linux enterprise distributions with active system metric logging.",
      },
      {
        entry_id: "work_2",
        employer: "Systems Limited",
        title: "Software Engineer",
        start_date: "2020-06",
        end_date: "2022-02",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Developed modular Spring Cloud microservices integrated with PostgreSQL databases, boosting query efficiency by 28%. Containerized enterprise components using Docker and maintained customer-facing REST API gateways on Linux servers.",
      },
    ],
  },
  education: {
    entries: [
      {
        institution: {
          raw: "FAST National University of Computer and Emerging Sciences (FAST-NUCES) (Lahore, Pakistan)",
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
        grade: "3.48 CGPA",
      },
    ],
  },
  skills_demonstrated: {
    skills: [
      {
        skill: "Java",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "processing over PKR 95M in monthly transactions",
        concrete_noun_present: true,
        evidence_span:
          "Architected enterprise billing and payment settlement microservices in Java 17 and Spring Boot, processing over PKR 95M in monthly transactions.",
        evidence_status: "confirmed",
      },
      {
        skill: "PostgreSQL",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "across 28M transactional records",
        concrete_noun_present: true,
        evidence_span:
          "Designed and optimized relational PostgreSQL schemas across 28M transactional records.",
        evidence_status: "confirmed",
      },
      {
        skill: "Docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "for rapid testing cycles",
        concrete_noun_present: true,
        evidence_span:
          "Packaged applications into Docker containers and automated CI/CD builds for rapid testing cycles.",
        evidence_status: "confirmed",
      },
      {
        skill: "REST API",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "incorporating token-based authentication",
        concrete_noun_present: true,
        evidence_span:
          "Developed secure, high-throughput REST API endpoints incorporating token-based authentication.",
        evidence_status: "confirmed",
      },
      {
        skill: "Linux",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Operated backend microservices on Linux enterprise distributions with active system metric logging.",
        evidence_status: "confirmed",
      },
    ],
  },
  skills_declared: {
    skills_declared: [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "Docker",
      "REST API",
      "Linux",
      "Git",
      "Maven",
    ],
  },
  logistics: {
    salary_expectation: {
      raw: "PKR 380,000 / month",
      normalized: {
        min: 380000,
        max: 380000,
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
  role_claims: {
    claims: [
      {
        claim_id: "c1",
        source_entry_ref: "work_1",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Java 17", syntactic_tier: "action_attributed", canonical_skill: "java" },
          { skill: "Spring Boot", syntactic_tier: "action_attributed", canonical_skill: "spring boot" },
          { skill: "REST API", syntactic_tier: "action_attributed", canonical_skill: "rest api" },
        ],
        raw_nouns: [],
        compact_action: "architected enterprise billing and settlement microservices",
        outcome_attached: "PKR 95M/mo txns",
        evidence_span:
          "Architected enterprise billing and payment settlement microservices in Java 17 and Spring Boot, processing over PKR 95M in monthly transactions.",
      },
      {
        claim_id: "c2",
        source_entry_ref: "work_1",
        claim_tier: "action_attributed",
        skills: [
          { skill: "PostgreSQL", syntactic_tier: "action_attributed", canonical_skill: "postgresql" },
          { skill: "Docker", syntactic_tier: "action_attributed", canonical_skill: "docker" },
        ],
        raw_nouns: [],
        compact_action: "optimized relational schemas and containerized CI/CD builds",
        outcome_attached: "28M txn records",
        evidence_span:
          "Designed and optimized relational PostgreSQL schemas across 28M transactional records. Packaged applications into Docker containers and automated CI/CD builds for rapid testing cycles.",
      },
      {
        claim_id: "c3",
        source_entry_ref: "work_2",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Spring Cloud", syntactic_tier: "action_attributed", canonical_skill: "spring boot" },
          { skill: "PostgreSQL", syntactic_tier: "action_attributed", canonical_skill: "postgresql" },
          { skill: "Docker", syntactic_tier: "action_attributed", canonical_skill: "docker" },
        ],
        raw_nouns: [],
        compact_action: "developed modular microservices and REST API gateways",
        outcome_attached: "+28% query efficiency",
        evidence_span:
          "Developed modular Spring Cloud microservices integrated with PostgreSQL databases, boosting query efficiency by 28%. Containerized enterprise components using Docker and maintained customer-facing REST API gateways on Linux servers.",
      },
    ],
  },
  notable_signals: { signals: [] },
  extraction_metadata: {
    file_hash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:45:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/bilal_ahmed_resume.pdf",
    warnings: [],
  },
};
