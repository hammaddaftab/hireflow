// Demo Candidate 1: Clean strong match (Tariq Mehmood)
// Action verbs, outcomes with numbers, all logistics stated. Fast-clear opening showcase.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate01Tariq: ParsedCandidateProfile = {
  id: "cand_tariq",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T10:00:00.000Z",
  updated_at: "2026-10-11T10:00:00.000Z",
  source_document: {
    filename: "tariq_mehmood_resume.pdf",
    file_size_bytes: 15352,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/tariq_mehmood_resume.pdf",
  },
  identity: {
    name: "Tariq Mehmood",
    email: "tariq.mehmood.dev@gmail.com",
    phone: "+923015549210",
    cnic: "37405-1829401-7",
    location: {
      raw: "Sector F-8/2, Islamabad, Pakistan",
      normalized: {
        city: "Islamabad",
        province: "Islamabad Capital Territory",
      },
    },
    links: [
      {
        address: "https://github.com/tariqmehmood-dev",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/tariq-mehmood-go",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "Retailo Technologies",
        title: "Senior Backend Engineer",
        start_date: "2023-01",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Architected order-routing microservices in Go handling over 18,000 requests/sec with 99.98% uptime, reducing p99 API latency by 44%. Designed and optimized PostgreSQL schema partitions and relational indexing strategies across 45M transaction records, cutting query execution times by 52%. Containerized distributed microservices with Docker multi-stage builds and automated CI pipelines, slashing container deployment image footprint by 62%. Developed mission-critical REST API endpoints incorporating idempotency keys and sliding-window rate limiting, processing PKR 120M in monthly settlement throughput. Operated container workloads on Linux virtual hosts with Redis caching layers, elevating cache hit ratio to 92% and mitigating database read contention.",
      },
      {
        entry_id: "work_2",
        employer: "Arbisoft",
        title: "Backend Software Engineer",
        start_date: "2021-06",
        end_date: "2022-12",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Engineered high-throughput financial settlement services in Go and PostgreSQL with strict ACID transactional integrity. Built robust partner-facing REST API services packaged with Docker, successfully integrating 12 commercial banking partners. Automated Linux host provisioning and server health diagnostic workflows, cutting deployment rollback incidents by 35%.",
      },
    ],
  },
  education: {
    entries: [
      {
        institution: {
          raw: "National University of Sciences and Technology (NUST), Islamabad, Pakistan",
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
        start_date: "2017",
        end_date: "2021",
        is_current: false,
        grade: "3.65 CGPA",
      },
    ],
  },
  skills_demonstrated: {
    skills: [
      {
        skill: "Go",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "reducing p99 API latency by 44%",
        concrete_noun_present: true,
        evidence_span:
          "Architected order-routing microservices in Go handling over 18,000 requests/sec with 99.98% uptime, reducing p99 API latency by 44%.",
        evidence_status: "confirmed",
      },
      {
        skill: "PostgreSQL",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "cutting query execution times by 52%",
        concrete_noun_present: true,
        evidence_span:
          "Designed and optimized PostgreSQL schema partitions and relational indexing strategies across 45M transaction records, cutting query execution times by 52%.",
        evidence_status: "confirmed",
      },
      {
        skill: "Docker",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "slashing container deployment image footprint by 62%",
        concrete_noun_present: true,
        evidence_span:
          "Containerized distributed microservices with Docker multi-stage builds and automated CI pipelines, slashing container deployment image footprint by 62%.",
        evidence_status: "confirmed",
      },
      {
        skill: "REST API",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "processing PKR 120M in monthly settlement throughput",
        concrete_noun_present: true,
        evidence_span:
          "Developed mission-critical REST API endpoints incorporating idempotency keys and sliding-window rate limiting, processing PKR 120M in monthly settlement throughput.",
        evidence_status: "confirmed",
      },
      {
        skill: "Linux",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: null,
        concrete_noun_present: true,
        evidence_span:
          "Operated container workloads on Linux virtual hosts with Redis caching layers, elevating cache hit ratio to 92% and mitigating database read contention.",
        evidence_status: "confirmed",
      },
      {
        skill: "Redis",
        source_entry_ref: "work_1",
        syntactic_tier: "action_attributed",
        outcome_attached: "elevating cache hit ratio to 92%",
        concrete_noun_present: true,
        evidence_span:
          "Operated container workloads on Linux virtual hosts with Redis caching layers, elevating cache hit ratio to 92% and mitigating database read contention.",
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
      "AWS",
      "Redis",
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
          { skill: "Go", syntactic_tier: "action_attributed", canonical_skill: "go" },
          { skill: "gRPC", syntactic_tier: "action_attributed", canonical_skill: "grpc" },
          { skill: "Kafka", syntactic_tier: "action_attributed", canonical_skill: "apache kafka" },
        ],
        raw_nouns: ["order-routing microservices"],
        compact_action: "architected order-routing microservices",
        outcome_attached: "18k rps, -44% p99",
        evidence_span: "Architected order-routing microservices in Go handling over 18,000 requests/sec with 99.98% uptime, reducing p99 API latency by 44%.",
      },
      {
        claim_id: "c2",
        source_entry_ref: "work_1",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Postgres", syntactic_tier: "action_attributed", canonical_skill: "postgresql" },
          { skill: "Redis", syntactic_tier: "action_attributed", canonical_skill: "redis" },
        ],
        raw_nouns: ["multi-tenant inventory ledger"],
        compact_action: "built multi-tenant inventory ledger",
        outcome_attached: "45M rows, -52% query time",
        evidence_span: "Designed and optimized PostgreSQL schema partitions and relational indexing strategies across 45M transaction records, cutting query execution times by 52%.",
      },
      {
        claim_id: "c3",
        source_entry_ref: "work_1",
        claim_tier: "action_attributed",
        skills: [],
        raw_nouns: ["Squad leadership"],
        compact_action: "led 6 engineers and owned checkout SLA",
        outcome_attached: "99.99% uptime",
        evidence_span: "Operated container workloads on Linux virtual hosts with Redis caching layers, elevating cache hit ratio to 92% and mitigating database read contention.",
      },
      {
        claim_id: "c4",
        source_entry_ref: "work_2",
        claim_tier: "action_attributed",
        skills: [
          { skill: "Python", syntactic_tier: "action_attributed", canonical_skill: "python" },
          { skill: "Django", syntactic_tier: "action_attributed", canonical_skill: "django" },
          { skill: "REST API", syntactic_tier: "action_attributed", canonical_skill: "rest api" },
        ],
        raw_nouns: ["B2B vendor settlement portal"],
        compact_action: "developed B2B vendor settlement portal",
        outcome_attached: "PKR 120M/mo",
        evidence_span: "Developed mission-critical REST API endpoints incorporating idempotency keys and sliding-window rate limiting, processing PKR 120M in monthly settlement throughput.",
      },
      {
        claim_id: "c5",
        source_entry_ref: "work_2",
        claim_tier: "peripheral_action",
        skills: [
          { skill: "Kubernetes", syntactic_tier: "peripheral_action", canonical_skill: "kubernetes" },
          { skill: "Terraform", syntactic_tier: "peripheral_action", canonical_skill: "terraform" },
        ],
        raw_nouns: ["deployment pipeline maintenance"],
        compact_action: "assisted platform squad with deployment pipeline maintenance",
        outcome_attached: null,
        evidence_span: "Containerized distributed microservices with Docker multi-stage builds and automated CI pipelines, slashing container deployment image footprint by 62%.",
      },
    ],
  },
  notable_signals: {
    signals: [
      {
        signal_id: "s1",
        context_label: "Open-Source",
        syntactic_tier: "action_attributed",
        raw_nouns: ["go-rate-limit"],
        compact_action: "maintainer of distributed rate limiter",
        outcome_attached: "1.4k GitHub stars",
        evidence_span: "Created and maintain go-rate-limit open source library with 1.4k stars.",
      },
    ],
  },
  extraction_metadata: {
    file_hash: "b629cda073f06daa040d6434088617e549a3906308d1b674038b9848798bb0b1",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:00:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/tariq_mehmood_resume.pdf",
    warnings: [],
  },
};
