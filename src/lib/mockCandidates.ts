import type { ParsedCandidateProfile } from "@/entities/candidate";

export const MOCK_CANDIDATES: ParsedCandidateProfile[] = [
  // 1. Hamza Tariq — The All-Clear Fast-Clear Hero
  // Passes all 7 blocking checks: 6y exp (>=5), TypeScript, React, Node.js, Kafka/EDA, PKR 500k (<=600k), 1 mo notice, BS CS.
  {
    id: "cand_hamza",
    applied_job_id: "job-sample-1",
    created_at: "2026-09-04T01:45:00.000Z",
    updated_at: "2026-09-04T01:45:00.000Z",
    source_document: {
      filename: "hamza_tariq_fullstack.pdf",
      file_size_bytes: 124000,
      mime_type: "application/pdf",
    },
    identity: {
      name: "Hamza Tariq",
      email: "hamza.tariq.dev@gmail.com",
      phone: "+923008459201",
      cnic: "35202-6194820-5",
      location: {
        raw: "House 24, Block C, Near Liberty Roundabout, Gulberg III, Lahore",
        normalized: {
          city: "Lahore",
          province: "Punjab",
        },
      },
      links: [
        {
          address: "https://github.com/hamzatariq-dev",
          platform: { raw: "GitHub", normalized: "github" },
        },
        {
          address: "https://linkedin.com/in/hamzatariq-fullstack",
          platform: { raw: "LinkedIn", normalized: "linkedin" },
        },
      ],
    },
    work_history: {
      entries: [
        {
          entry_id: "work_1",
          employer: "VentureDive",
          title: "Senior Full Stack Engineer",
          start_date: "2023-01",
          end_date: null,
          is_current: true,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Architected high-throughput microservices using Node.js and TypeScript, handling 15M daily requests. Built frontend features in Next.js 14 and React with Tailwind CSS, reducing bundle size by 35%. Designed an event-driven architecture using Kafka and PostgreSQL, cutting API latency by 40%.",
        },
        {
          entry_id: "work_2",
          employer: "Arbisoft",
          title: "Full Stack Engineer",
          start_date: "2020-07",
          end_date: "2022-12",
          is_current: false,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Developed enterprise dashboard applications in React, TypeScript, and Node.js with PostgreSQL. Implemented automated CI/CD pipelines and unit testing suites, decreasing release regression by 25%.",
        },
      ],
    },
    education: {
      entries: [
        {
          institution: {
            raw: "FAST National University of Computer and Emerging Sciences",
            normalized: "FAST National University",
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
          grade: "3.4 CGPA",
        },
      ],
    },
    skills_demonstrated: {
      skills: [
        {
          skill: "TypeScript",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "handling 15M daily requests",
          concrete_noun_present: true,
          evidence_span: "Architected high-throughput microservices using Node.js and TypeScript, handling 15M daily requests.",
          evidence_status: "confirmed",
        },
        {
          skill: "React",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "reducing bundle size by 35%",
          concrete_noun_present: true,
          evidence_span: "Built frontend features in Next.js 14 and React with Tailwind CSS, reducing bundle size by 35%.",
          evidence_status: "confirmed",
        },
        {
          skill: "Node.js",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "handling 15M daily requests",
          concrete_noun_present: true,
          evidence_span: "Architected high-throughput microservices using Node.js and TypeScript, handling 15M daily requests.",
          evidence_status: "confirmed",
        },
        {
          skill: "PostgreSQL",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "cutting API latency by 40%",
          concrete_noun_present: true,
          evidence_span: "Designed an event-driven architecture using Kafka and PostgreSQL, cutting API latency by 40%.",
          evidence_status: "confirmed",
        },
        {
          skill: "System Design",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "cutting API latency by 40%",
          concrete_noun_present: true,
          evidence_span: "Designed an event-driven architecture using Kafka and PostgreSQL, cutting API latency by 40%.",
          evidence_status: "confirmed",
        },
      ],
    },
    skills_declared: {
      skills_declared: [
        "TypeScript",
        "JavaScript",
        "React",
        "Next.js",
        "Node.js",
        "PostgreSQL",
        "Tailwind CSS",
        "Kafka",
        "Docker",
        "Redis",
        "REST APIs",
      ],
    },
    logistics: {
      salary_expectation: {
        raw: "PKR 450,000 - 550,000 / month",
        normalized: {
          min: 450000,
          max: 550000,
          currency: "PKR",
        },
      },
      notice_period: {
        raw: "1 month",
        normalized: {
          value: 1,
          unit: "months",
        },
      },
      stated_relocation_willingness: "willing",
      stated_availability: "1 month",
      languages: ["English", "Urdu"],
    },
    extraction_metadata: {
      file_hash: "4a8a08f09d37b73795649038408b5f3300d12608b3d637b6f634563d0c27948a",
      aspect_versions: {
        identity: "1.0.0",
        education: "1.0.0",
        work_history: "1.0.0",
        skills_demonstrated: "1.0.0",
        skills_declared: "1.0.0",
        logistics: "1.0.0",
      },
      extracted_at: "2026-09-04T01:45:00.000Z",
      parse_quality: "full",
      raw_text_ref: "storage://resumes/hamza_tariq_fullstack.pdf",
      warnings: [],
    },
  },

  // 2. Muhammad Ghulam Jillani — parsed from mock_resume_a.pdf
  // AI/Data Science background, USD salary, entrepreneurial mentorship, multiple orphan skills.
  {
    id: "cand_jillani",
    applied_job_id: "job-sample-1",
    created_at: "2026-09-04T01:15:00.000Z",
    updated_at: "2026-09-04T01:15:00.000Z",
    source_document: {
      filename: "mock_resume_a.pdf",
      file_size_bytes: 148200,
      mime_type: "application/pdf",
    },
    identity: {
      name: "Muhammad Ghulam Jillani",
      email: "m.g.jillani123@gmail.com",
      phone: "+923211174167",
      cnic: "35201-8472910-3",
      location: {
        raw: "Sector J, DHA Phase 5, Lahore, Pakistan",
        normalized: {
          city: "Lahore",
          province: "Punjab",
        },
      },
      links: [
        {
          address: "https://linkedin.com/in/mgjillani",
          platform: { raw: "LinkedIn", normalized: "linkedin" },
        },
        {
          address: "https://github.com/mgjillani",
          platform: { raw: "GitHub", normalized: "github" },
        },
        {
          address: "https://JillaniPortfolio.com",
          platform: { raw: "Portfolio", normalized: "portfolio" },
        },
      ],
    },
    work_history: {
      entries: [
        {
          entry_id: "work_1",
          employer: "GOOGLE-KAGGLE",
          title: "AI Data Scientist Kaggle Master Mentor",
          start_date: "2022-12",
          end_date: "2024-11",
          is_current: false,
          employment_type: {
            value: "contract",
            status: "confirmed",
          },
          raw_description:
            "Championed mentorship initiatives through the Kaggle-X BIPOC Mentorship Program, dedicating 20 hours weekly to guiding aspiring data scientists in technical skill development. Led a team of four mentees, enhancing their skills in data science, machine learning, and real-world problem-solving.",
        },
        {
          entry_id: "work_2",
          employer: "Crypto-Express",
          title: "Data Scientist",
          start_date: "2022-01",
          end_date: "2022-12",
          is_current: false,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Developed an Anti-spoofing Face-App, enhancing digital identity security and reducing identity fraud by 70%. Applied AI and ML techniques to solve industry-critical issues, improving efficiency by 25% and reducing operational costs by 15%. Engineered predictive models leading to a 20% revenue increase through data-driven decision-making.",
        },
        {
          entry_id: "work_3",
          employer: "Pakistan Freelancing Training Center",
          title: "Artificial Intelligence Engineer",
          start_date: "2021-01",
          end_date: "2021-12",
          is_current: false,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Led AI and Data Science training sessions, preparing students to tackle real-world challenges. Designed and deployed models using TensorFlow and Keras, improving system efficiency and accuracy. Automated repetitive data tasks using Python, significantly reducing manual labor and error rates.",
        },
      ],
    },
    education: {
      entries: [
        {
          institution: {
            raw: "Institute of Management Sciences",
            normalized: "Institute of Management Sciences",
          },
          degree_level: {
            raw: "Bachelor in Computer Science",
            normalized: "bachelors",
          },
          field: {
            raw: "Artificial Intelligence and Computer Science",
            normalized: "Computer Science",
          },
          start_date: "2016",
          end_date: "2020",
          is_current: false,
          grade: "First Division",
        },
      ],
    },
    skills_demonstrated: {
      skills: [
        {
          skill: "Python",
          source_entry_ref: "work_3",
          syntactic_tier: "action_attributed",
          outcome_attached: "significantly reducing manual labor and error rates",
          concrete_noun_present: true,
          evidence_span: "Automated repetitive data tasks using Python, significantly reducing manual labor and error rates.",
          evidence_status: "confirmed",
        },
        {
          skill: "TensorFlow",
          source_entry_ref: "work_3",
          syntactic_tier: "action_attributed",
          outcome_attached: "improving system efficiency and accuracy",
          concrete_noun_present: true,
          evidence_span: "Designed and deployed models using TensorFlow and Keras, improving system efficiency and accuracy.",
          evidence_status: "confirmed",
        },
        {
          skill: "Machine Learning",
          source_entry_ref: "work_2",
          syntactic_tier: "action_attributed",
          outcome_attached: "improving efficiency by 25% and reducing operational costs by 15%",
          concrete_noun_present: true,
          evidence_span: "Applied AI and ML techniques to solve industry-critical issues, improving efficiency by 25% and reducing operational costs by 15%.",
          evidence_status: "confirmed",
        },
        {
          skill: "FastAPI",
          source_entry_ref: "work_2",
          syntactic_tier: "peripheral_action",
          outcome_attached: "reducing document processing time by 60%",
          concrete_noun_present: true,
          evidence_span: "Deployed as an interactive Streamlit application and FastAPI, reducing document processing time by 60%.",
          evidence_status: "ambiguous",
        },
      ],
    },
    skills_declared: {
      skills_declared: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "Keras",
        "Scikit-Learn",
        "OpenCV",
        "FastAPI",
        "Streamlit",
        "LangChain",
        "RAG",
        "Docker",
        "Pandas",
        "NumPy",
        "SQL",
      ],
    },
    logistics: {
      salary_expectation: {
        raw: "USD 2,500 - 3,500 / month",
        normalized: {
          min: 2500,
          max: 3500,
          currency: "USD",
        },
      },
      notice_period: {
        raw: "2 weeks",
        normalized: {
          value: 2,
          unit: "weeks",
        },
      },
      stated_relocation_willingness: "willing",
      stated_availability: "within 2 weeks",
      languages: ["English", "Urdu"],
    },
    extraction_metadata: {
      file_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      aspect_versions: {
        identity: "1.0.0",
        education: "1.0.0",
        work_history: "1.0.0",
        skills_demonstrated: "1.0.0",
        skills_declared: "1.0.0",
        logistics: "1.0.0",
      },
      extracted_at: "2026-09-04T01:15:00.000Z",
      parse_quality: "full",
      raw_text_ref: "storage://resumes/mock_resume_a.pdf",
      warnings: [],
    },
  },

  // 3. Abdullah Khan — parsed from mock_resume_b.pdf
  // Mechanical / CNC Operator, In-Progress DAE + Completed Matric, Multi-Education (+1 more), Immediate availability.
  {
    id: "cand_abdullah",
    applied_job_id: "job-sample-1",
    created_at: "2026-09-04T01:30:00.000Z",
    updated_at: "2026-09-04T01:30:00.000Z",
    source_document: {
      filename: "mock_resume_b.pdf",
      file_size_bytes: 89400,
      mime_type: "application/pdf",
    },
    identity: {
      name: "Abdullah Khan",
      email: "saadmuhammad592@gmail.com",
      phone: "+923369073454",
      cnic: "37405-9876543-1",
      location: {
        raw: "Shop 4, Street 9, Commercial Market, Satellite Town, Rawalpindi",
        normalized: {
          city: "Rawalpindi",
          province: "Punjab",
        },
      },
      links: [
        {
          address: "https://linkedin.com/in/abdullah-khan-cnc",
          platform: { raw: "LinkedIn", normalized: "linkedin" },
        },
      ],
    },
    work_history: {
      entries: [
        {
          entry_id: "work_1",
          employer: "Construction Technology Training Institute (CTTI)",
          title: "CNC Lathe Machine Operator Intern",
          start_date: "2024-01",
          end_date: null,
          is_current: true,
          employment_type: {
            value: "internship",
            status: "confirmed",
          },
          raw_description:
            "Operated CNC lathe and manual lathe machines performing facing, boring, turning, grooving, and knurling operations with precision measurement and safety guidelines.",
        },
        {
          entry_id: "work_2",
          employer: "Final Year Engineering Project",
          title: "Mechanical Design & Fabrication Lead",
          start_date: "2023-08",
          end_date: "2024-05",
          is_current: false,
          employment_type: {
            value: "contract",
            status: "inferred",
          },
          raw_description:
            "Designed and fabricated the wheelchair's base frame and integrated mechanical systems, ensuring structural strength, stability, safety, and durability using ARC welding and precision measurement tools.",
        },
      ],
    },
    education: {
      entries: [
        {
          institution: {
            raw: "Construction Technology Training Institute (CTTI)",
            normalized: "Construction Technology Training Institute",
          },
          degree_level: {
            raw: "DAE Mechanical",
            normalized: "diploma",
          },
          field: {
            raw: "Mechanical Technology",
            normalized: "Mechanical Engineering",
          },
          start_date: "2023",
          end_date: null,
          is_current: true,
          grade: "Result Awaited",
        },
        {
          institution: {
            raw: "Government High School Rawalpindi",
            normalized: "Government High School Rawalpindi",
          },
          degree_level: {
            raw: "Matric (Science)",
            normalized: "high_school",
          },
          field: {
            raw: "Science",
            normalized: "General Science",
          },
          start_date: "2021",
          end_date: "2023",
          is_current: false,
          grade: "Grade B",
        },
      ],
    },
    skills_demonstrated: {
      skills: [
        {
          skill: "CNC Lathe Machine Operation",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: null,
          concrete_noun_present: true,
          evidence_span: "Operated CNC lathe and manual lathe machines performing facing, boring, turning, grooving, and knurling operations.",
          evidence_status: "confirmed",
        },
        {
          skill: "ARC Welding",
          source_entry_ref: "work_2",
          syntactic_tier: "action_attributed",
          outcome_attached: "ensuring structural strength, stability, safety, and durability",
          concrete_noun_present: true,
          evidence_span: "Utilized CNC and manual machining, ARC welding, drilling, and precision measurement tools to manufacture and assemble components.",
          evidence_status: "confirmed",
        },
      ],
    },
    skills_declared: {
      skills_declared: [
        "CNC Lathe Machine Operation",
        "Manual Lathe",
        "Facing",
        "Boring",
        "Turning",
        "Grooving",
        "Knurling",
        "ARC Welding",
        "Drilling",
        "Precision Measurement",
        "MS Office",
      ],
    },
    logistics: {
      salary_expectation: {
        raw: "PKR 50,000 - 70,000 / month",
        normalized: {
          min: 50000,
          max: 70000,
          currency: "PKR",
        },
      },
      notice_period: {
        raw: "Immediate",
        normalized: {
          value: 0,
          unit: "days",
        },
      },
      stated_relocation_willingness: "willing",
      stated_availability: "immediate",
      languages: ["English", "Urdu"],
    },
    extraction_metadata: {
      file_hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      aspect_versions: {
        identity: "1.0.0",
        education: "1.0.0",
        work_history: "1.0.0",
        skills_demonstrated: "1.0.0",
        skills_declared: "1.0.0",
        logistics: "1.0.0",
      },
      extracted_at: "2026-09-04T01:30:00.000Z",
      parse_quality: "full",
      raw_text_ref: "storage://resumes/mock_resume_b.pdf",
      warnings: [],
    },
  },

  // 4. Dr. Ayesha Malik — Advanced Degree (Masters + Bachelors), Over-Budget Salary Knockout, Unwilling Relocation
  {
    id: "cand_ayesha",
    applied_job_id: "job-sample-1",
    created_at: "2026-09-04T02:00:00.000Z",
    updated_at: "2026-09-04T02:00:00.000Z",
    source_document: {
      filename: "ayesha_malik_frontend.pdf",
      file_size_bytes: 112000,
      mime_type: "application/pdf",
    },
    identity: {
      name: "Dr. Ayesha Malik",
      email: "ayesha.malik.ux@gmail.com",
      phone: "+923335129844",
      cnic: "37405-1829304-2",
      location: {
        raw: "Street 14, Sector F-10/2, Islamabad",
        normalized: {
          city: "Islamabad",
          province: "Federal",
        },
      },
      links: [
        {
          address: "https://github.com/ayeshamalik-ui",
          platform: { raw: "GitHub", normalized: "github" },
        },
        {
          address: "https://linkedin.com/in/ayeshamalik-frontend",
          platform: { raw: "LinkedIn", normalized: "linkedin" },
        },
        {
          address: "https://twitter.com/ayesha_dev",
          platform: { raw: "Twitter", normalized: "twitter" },
        },
        {
          address: "https://ayeshamalik.design",
          platform: { raw: "Portfolio", normalized: "portfolio" },
        },
      ],
    },
    work_history: {
      entries: [
        {
          entry_id: "work_1",
          employer: "Confiz",
          title: "Frontend React Architect",
          start_date: "2022-03",
          end_date: null,
          is_current: true,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Engineered responsive user interfaces using React, TypeScript, and Next.js. Built accessible component design systems in Tailwind CSS and Figma, decreasing front-end defect rate by 45%.",
        },
        {
          entry_id: "work_2",
          employer: "Techlogix",
          title: "Senior UI Engineer",
          start_date: "2019-06",
          end_date: "2022-02",
          is_current: false,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Built large-scale single page applications in React and JavaScript. Mentored 5 junior engineers and optimized client bundle sizes by 30%.",
        },
      ],
    },
    education: {
      entries: [
        {
          institution: {
            raw: "National University of Sciences and Technology (NUST)",
            normalized: "National University of Sciences and Technology",
          },
          degree_level: {
            raw: "MS Computer Science",
            normalized: "masters",
          },
          field: {
            raw: "Human-Computer Interaction",
            normalized: "Computer Science",
          },
          start_date: "2020",
          end_date: "2022",
          is_current: false,
          grade: "3.85 CGPA",
        },
        {
          institution: {
            raw: "National University of Sciences and Technology (NUST)",
            normalized: "National University of Sciences and Technology",
          },
          degree_level: {
            raw: "BS Software Engineering",
            normalized: "bachelors",
          },
          field: {
            raw: "Software Engineering",
            normalized: "Computer Science",
          },
          start_date: "2016",
          end_date: "2020",
          is_current: false,
          grade: "3.6 CGPA",
        },
      ],
    },
    skills_demonstrated: {
      skills: [
        {
          skill: "React",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "decreasing front-end defect rate by 45%",
          concrete_noun_present: true,
          evidence_span: "Engineered responsive user interfaces using React, TypeScript, and Next.js.",
          evidence_status: "confirmed",
        },
        {
          skill: "TypeScript",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: null,
          concrete_noun_present: true,
          evidence_span: "Engineered responsive user interfaces using React, TypeScript, and Next.js.",
          evidence_status: "confirmed",
        },
        {
          skill: "Tailwind CSS",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "decreasing front-end defect rate by 45%",
          concrete_noun_present: true,
          evidence_span: "Built accessible component design systems in Tailwind CSS and Figma, decreasing front-end defect rate by 45%.",
          evidence_status: "confirmed",
        },
      ],
    },
    skills_declared: {
      skills_declared: [
        "React",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "Tailwind CSS",
        "HTML/CSS",
        "Figma",
        "Redux",
      ],
    },
    logistics: {
      salary_expectation: {
        raw: "PKR 650,000 / month (Firm)",
        normalized: {
          min: 650000,
          max: 650000,
          currency: "PKR",
        },
      },
      notice_period: {
        raw: "1 month",
        normalized: {
          value: 1,
          unit: "months",
        },
      },
      stated_relocation_willingness: "unwilling",
      stated_availability: "1 month",
      languages: ["English", "Urdu"],
    },
    extraction_metadata: {
      file_hash: "9b642e7d77054117b9beea6a88b569dae138a4a5441865231bf9ad60942ff65a",
      aspect_versions: {
        identity: "1.0.0",
        education: "1.0.0",
        work_history: "1.0.0",
        skills_demonstrated: "1.0.0",
        skills_declared: "1.0.0",
        logistics: "1.0.0",
      },
      extracted_at: "2026-09-04T02:00:00.000Z",
      parse_quality: "full",
      raw_text_ref: "storage://resumes/ayesha_malik_frontend.pdf",
      warnings: [],
    },
  },

  // 5. Zainab Abbas — Weak / Ambiguous Evidence Test Case ("Needs Review")
  // Experience verified (5.1y), but skills are peripheral / context_listed / orphan claims (amber status icons).
  {
    id: "cand_zainab",
    applied_job_id: "job-sample-1",
    created_at: "2026-09-04T02:30:00.000Z",
    updated_at: "2026-09-04T02:30:00.000Z",
    source_document: {
      filename: "zainab_abbas_resume.pdf",
      file_size_bytes: 98000,
      mime_type: "application/pdf",
    },
    identity: {
      name: "Zainab Abbas",
      email: "zainab.abbas.tech@outlook.com",
      phone: "+923018899221",
      cnic: "42101-3344556-8",
      location: {
        raw: "Block 4, Clifton, Karachi, Sindh",
        normalized: {
          city: "Karachi",
          province: "Sindh",
        },
      },
      links: [
        {
          address: "https://gitlab.com/zainab-dev",
          platform: { raw: "GitLab", normalized: "gitlab" },
        },
        {
          address: "https://zainab-techblog.dev",
          platform: { raw: "Technical Blog", normalized: "other" },
        },
      ],
    },
    work_history: {
      entries: [
        {
          entry_id: "work_1",
          employer: "Systems Limited",
          title: "Full Stack Web Developer",
          start_date: "2021-06",
          end_date: null,
          is_current: true,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Worked within team on web applications. Assisted with React UI maintenance and bug resolution. Environment stack: TypeScript, Node.js, Express, Sass, Webpack.",
        },
        {
          entry_id: "work_2",
          employer: "Folio3",
          title: "Junior Software Engineer",
          start_date: "2019-04",
          end_date: "2021-05",
          is_current: false,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Contributed to database schemas and REST endpoints for logistics client portals.",
        },
      ],
    },
    education: {
      entries: [
        {
          institution: {
            raw: "University of the Punjab (PUCIT)",
            normalized: "University of the Punjab",
          },
          degree_level: {
            raw: "BS Information Technology",
            normalized: "bachelors",
          },
          field: {
            raw: "Information Technology",
            normalized: "Information Technology",
          },
          start_date: "2015",
          end_date: "2019",
          is_current: false,
          grade: null,
        },
      ],
    },
    skills_demonstrated: {
      skills: [
        {
          skill: "React",
          source_entry_ref: "work_1",
          syntactic_tier: "peripheral_action",
          outcome_attached: null,
          concrete_noun_present: true,
          evidence_span: "Assisted with React UI maintenance and bug resolution.",
          evidence_status: "ambiguous",
        },
        {
          skill: "TypeScript",
          source_entry_ref: "work_1",
          syntactic_tier: "context_listed",
          outcome_attached: null,
          concrete_noun_present: false,
          evidence_span: "Environment stack: TypeScript, Node.js, Express, Sass, Webpack.",
          evidence_status: "ambiguous",
        },
      ],
    },
    skills_declared: {
      skills_declared: [
        "TypeScript",
        "React",
        "Node.js",
        "Express",
        "MongoDB",
        "PostgreSQL",
        "Webpack",
        "Sass",
        "Git",
      ],
    },
    logistics: {
      salary_expectation: {
        raw: "PKR 400,000 / month",
        normalized: {
          min: 400000,
          max: 400000,
          currency: "PKR",
        },
      },
      notice_period: {
        raw: "3 weeks",
        normalized: {
          value: 3,
          unit: "weeks",
        },
      },
      stated_relocation_willingness: "willing",
      stated_availability: "within 3 weeks",
      languages: ["English", "Urdu", "Sindhi"],
    },
    extraction_metadata: {
      file_hash: "5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c",
      aspect_versions: {
        identity: "1.0.0",
        education: "1.0.0",
        work_history: "1.0.0",
        skills_demonstrated: "1.0.0",
        skills_declared: "1.0.0",
        logistics: "1.0.0",
      },
      extracted_at: "2026-09-04T02:30:00.000Z",
      parse_quality: "full",
      raw_text_ref: "storage://resumes/zainab_abbas_resume.pdf",
      warnings: [],
    },
  },

  // 6. Bilal Ahmed — Golang Backend Developer (Unspecified Location & Unstated Logistics Edge Case)
  // Vague location ('Anywhere in Pakistan') falls into 'Unspecified' bucket.
  // Salary and relocation unstated (tests logistics not_stated follow-up checklist).
  {
    id: "cand_bilal",
    applied_job_id: "job-sample-1",
    created_at: "2026-09-04T02:15:00.000Z",
    updated_at: "2026-09-04T02:15:00.000Z",
    source_document: {
      filename: "bilal_ahmed_backend.pdf",
      file_size_bytes: 105000,
      mime_type: "application/pdf",
    },
    identity: {
      name: "Bilal Ahmed",
      email: "bilal.ahmed.go@gmail.com",
      phone: "+923124567890",
      cnic: "35201-4455667-9",
      location: {
        raw: "Anywhere in Pakistan (Fully Remote / Open to travel)",
        normalized: null, // Vague/unresolvable location falls into 'Unspecified' bucket
      },
      links: [
        {
          address: "https://github.com/bilalahmed-dev",
          platform: { raw: "GitHub", normalized: "github" },
        },
      ],
    },
    work_history: {
      entries: [
        {
          entry_id: "work_1",
          employer: "RemoteStack Inc.",
          title: "Backend Go Developer",
          start_date: "2021-06",
          end_date: null,
          is_current: true,
          employment_type: {
            value: "full_time",
            status: "confirmed",
          },
          raw_description:
            "Developed concurrent microservices in Go and gRPC, optimizing message pipelines for 8M events daily. Implemented Redis caching layers reducing database query frequency by 50%. Integrated PostgreSQL data stores.",
        },
      ],
    },
    education: {
      entries: [
        {
          institution: {
            raw: "University of Central Punjab",
            normalized: "University of Central Punjab",
          },
          degree_level: {
            raw: "BS Computer Science",
            normalized: "bachelors",
          },
          field: {
            raw: "Computer Science",
            normalized: "Computer Science",
          },
          start_date: "2017",
          end_date: "2021",
          is_current: false,
          grade: "3.2 CGPA",
        },
      ],
    },
    skills_demonstrated: {
      skills: [
        {
          skill: "Go",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "optimizing message pipelines for 8M events daily",
          concrete_noun_present: true,
          evidence_span: "Developed concurrent microservices in Go and gRPC, optimizing message pipelines for 8M events daily.",
          evidence_status: "confirmed",
        },
        {
          skill: "Redis",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: "reducing database query frequency by 50%",
          concrete_noun_present: true,
          evidence_span: "Implemented Redis caching layers reducing database query frequency by 50%.",
          evidence_status: "confirmed",
        },
        {
          skill: "PostgreSQL",
          source_entry_ref: "work_1",
          syntactic_tier: "action_attributed",
          outcome_attached: null,
          concrete_noun_present: true,
          evidence_span: "Integrated PostgreSQL data stores.",
          evidence_status: "confirmed",
        },
      ],
    },
    skills_declared: {
      skills_declared: ["Go", "gRPC", "Docker", "Redis", "PostgreSQL", "Kafka"],
    },
    logistics: {
      salary_expectation: {
        raw: null,
        normalized: null,
      },
      notice_period: {
        raw: "Immediate",
        normalized: {
          value: 0,
          unit: "days",
        },
      },
      stated_relocation_willingness: "not_stated",
      stated_availability: "not_stated",
      languages: ["English", "Urdu"],
    },
    extraction_metadata: {
      file_hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      aspect_versions: {
        identity: "1.0.0",
        education: "1.0.0",
        work_history: "1.0.0",
        skills_demonstrated: "1.0.0",
        skills_declared: "1.0.0",
        logistics: "1.0.0",
      },
      extracted_at: "2026-09-04T02:15:00.000Z",
      parse_quality: "full",
      raw_text_ref: "storage://resumes/bilal_ahmed_backend.pdf",
      warnings: [],
    },
  },
];
