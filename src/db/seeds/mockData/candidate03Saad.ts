// Demo Candidate 3: Keyword stuffer (Saad Rafiq)
// Required skills listed literally in skills section, zero narrative evidence. Second-look landing with high orphan count.

import type { ParsedCandidateProfile } from "@/entities/candidate";

export const candidate03Saad: ParsedCandidateProfile = {
  id: "cand_saad_stuffer",
  applied_job_id: "job-sample-1",
  created_at: "2026-10-11T09:50:00.000Z",
  updated_at: "2026-10-11T09:50:00.000Z",
  source_document: {
    filename: "saad_rafiq_resume.pdf",
    file_size_bytes: 14477,
    mime_type: "application/pdf",
    url: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/saad_rafiq_resume.pdf",
  },
  identity: {
    name: "Saad Rafiq",
    email: "saad.rafiq.eng@gmail.com",
    phone: "+923218294017",
    cnic: "42101-9284019-1",
    location: {
      raw: "DHA Phase 6, Karachi, Pakistan",
      normalized: {
        city: "Karachi",
        province: "Sindh",
      },
    },
    links: [
      {
        address: "https://github.com/saadrafiq-dev",
        platform: { raw: "GitHub", normalized: "github" },
      },
      {
        address: "https://linkedin.com/in/saad-rafiq-engineering",
        platform: { raw: "LinkedIn", normalized: "linkedin" },
      },
    ],
  },
  work_history: {
    entries: [
      {
        entry_id: "work_1",
        employer: "Techlogix",
        title: "Senior Software Developer",
        start_date: "2023-04",
        end_date: null,
        is_current: true,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Collaborated with engineering managers and product owners to deliver software features according to business specifications. Participated in daily standup meetings, bi-weekly sprint planning, and retrospective sessions. Conducted peer code reviews, resolved Jira bug tickets, and maintained comprehensive team documentation. Mentored junior associate team members on engineering standards, coding guidelines, and sprint deliverables. Coordinated with customer support engineers during production deployments to verify feature availability.",
      },
      {
        entry_id: "work_2",
        employer: "Folio3",
        title: "Software Engineer",
        start_date: "2021-07",
        end_date: "2023-03",
        is_current: false,
        employment_type: {
          value: "full_time",
          status: "confirmed",
        },
        raw_description:
          "Contributed to web platform enhancements and backend defect resolution across multiple milestones. Coordinated with Quality Assurance analysts to validate software functionality prior to release. Analyzed client tickets and implemented code fixes to improve system reliability and maintainability. Updated technical specifications, attended architecture meetings, and tracked delivery milestones.",
      },
    ],
  },
  education: {
    entries: [
      {
        institution: {
          raw: "Ghulam Ishaq Khan Institute of Science and Technology (GIKI), Topi, Pakistan",
          normalized: "Ghulam Ishaq Khan Institute of Science & Technology",
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
        grade: null,
      },
    ],
  },
  skills_demonstrated: {
    skills: [],
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
      "gRPC",
      "Apache Kafka",
      "Git",
      "CI/CD",
      "JIRA",
      "Agile Methodologies",
    ],
  },
  logistics: {
    salary_expectation: {
      raw: "PKR 330,000 / month",
      normalized: {
        min: 330000,
        max: 330000,
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
  extraction_metadata: {
    file_hash: "f7866290109c203d9342ef552187edceb8e76272af69c4a86eb98aad151828d1",
    aspect_versions: {
      identity: "1.0.0",
      education: "1.0.0",
      work_history: "1.0.0",
      skills_demonstrated: "1.0.0",
      skills_declared: "1.0.0",
      logistics: "1.0.0",
    },
    extracted_at: "2026-10-11T09:10:00.000Z",
    parse_quality: "full",
    raw_text_ref: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/saad_rafiq_resume.pdf",
    warnings: [],
  },
};
