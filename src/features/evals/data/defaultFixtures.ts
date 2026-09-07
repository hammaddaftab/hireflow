import type { ExperienceTestFixture } from "../types";

export const DEFAULT_EXPERIENCE_FIXTURES: ExperienceTestFixture[] = [
  {
    id: "fixture-user-reported-kaggle",
    title: "User Issue: Kaggle Mentor + Crypto-Express + Freelance Center",
    description:
      "Exact reproduction of user scenario. 3 distinct sequential roles spanning Dec 2022 to Nov 2024 (24 mos), Jan 2022 to Dec 2022 (12 mos), and Jan 2021 to Dec 2021 (12 mos). Total career duration is ~4.0 years.",
    category: "user_reported_bug",
    resumeText: `EXPERIENCE

AI Data Scientist Kaggle Master Mentor at GOOGLE-KAGGLE
2022-12 - 2024-11
Championed mentorship initiatives through the Kaggle-X BIPOC Mentorship Program, dedicating 20 hours weekly to guiding aspiring data scientists in technical skill development. Led a team of four mentees, enhancing their skills in data science, machine learning, and real-world problem-solving.

Data Scientist at Crypto-Express
2022-01 - 2022-12
Developed an Anti-spoofing Face-App, enhancing digital identity security and reducing identity fraud by 70%. Applied AI and ML techniques to solve industry-critical issues, improving efficiency by 25% and reducing operational costs by 15%. Engineered predictive models leading to a 20% revenue increase through data-driven decision-making.

Artificial Intelligence Engineer at Pakistan Freelancing Training Center
2021-01 - 2021-12
Led AI and Data Science training sessions, preparing students to tackle real-world challenges. Designed and deployed models using TensorFlow and Keras, improving system efficiency and accuracy. Automated repetitive data tasks using Python, significantly reducing manual labor and error rates.`,
    expected: {
      totalYears: 4.0,
      fullTimeYears: 4.0,
      rolesCount: 3,
      roles: [
        {
          title: "AI Data Scientist Kaggle Master Mentor",
          employer: "GOOGLE-KAGGLE",
          startDate: "2022-12",
          endDate: "2024-11",
          approxMonths: 24,
        },
        {
          title: "Data Scientist",
          employer: "Crypto-Express",
          startDate: "2022-01",
          endDate: "2022-12",
          approxMonths: 12,
        },
        {
          title: "Artificial Intelligence Engineer",
          employer: "Pakistan Freelancing Training Center",
          startDate: "2021-01",
          endDate: "2021-12",
          approxMonths: 12,
        },
      ],
    },
    targetJobRequirement: {
      minYears: 5,
      blocking: true,
    },
    toleranceYears: 0.2,
    createdAt: "2026-09-07T12:00:00Z",
  },
  {
    id: "fixture-standard-enterprise-progression",
    title: "Standard Enterprise Career Progression (5.5 Years Full-Time)",
    description:
      "Two back-to-back full-time software engineering roles without gaps. Tests standard corporate tenure summation.",
    category: "standard_progression",
    resumeText: `WORK EXPERIENCE

Senior Software Engineer | Apex Cloud Systems
2021-06 - 2024-12 (Full-time)
- Architected resilient event-driven microservices processing 12M daily transactions with 99.99% uptime.
- Directed an agile squad of 6 engineers, spearheading cloud migration initiatives to Kubernetes.

Software Engineer | Nexus Digital Solutions
2019-06 - 2021-05 (Full-time)
- Developed and maintained critical REST and GraphQL payment gateway endpoints using Node.js and TypeScript.
- Optimized PostgreSQL database indexes, decreasing query latency by 45%.`,
    expected: {
      totalYears: 5.5,
      fullTimeYears: 5.5,
      rolesCount: 2,
    },
    targetJobRequirement: {
      minYears: 5,
      blocking: true,
    },
    toleranceYears: 0.2,
    createdAt: "2026-09-07T12:00:00Z",
  },
  {
    id: "fixture-concurrent-overlapping-roles",
    title: "Concurrent Overlapping Roles (Calendar Tenure vs Naive Sum)",
    description:
      "Tests handling of concurrent roles where candidate held a full-time position while consulting part-time during the same calendar year. Stressed against double-counting overlap.",
    category: "concurrency_overlap",
    resumeText: `PROFESSIONAL HISTORY

Lead Platform Engineer - FinCorp Technologies
2021-01 - 2023-12 (Full-Time)
- Led platform infrastructure modernization, migrating legacy monolithic services to containerized AWS ECS clusters.
- Enforced zero-downtime blue/green deployment automations.

Cloud Infrastructure Consultant - Venture Labs
2022-01 - 2022-12 (Contract / Part-Time)
- Provided 15 hours weekly advisory on Terraform IaC configurations and IAM least-privilege policies.
- Audited cloud architecture and trimmed cloud hosting costs by 22%.`,
    expected: {
      totalYears: 3.0, // Non-overlapping calendar span: 2021-01 through 2023-12 (36 months = 3.0 yrs)
      fullTimeYears: 3.0,
      rolesCount: 2,
    },
    targetJobRequirement: {
      minYears: 3,
      blocking: true,
    },
    toleranceYears: 0.2,
    createdAt: "2026-09-07T12:00:00Z",
  },
  {
    id: "fixture-contract-and-freelance-heavy",
    title: "Freelance & Independent Contractor Dominant Profile",
    description:
      "Candidate with extensive freelance and contract projects. Stresses the evaluator distinction between total career experience and full-time requirements.",
    category: "contract_freelance",
    resumeText: `EXPERIENCE

Senior React Developer (Contract)
FinTech Advisory Group | 2023-01 - 2024-06
- Spearheaded development of institutional trader dashboard in Next.js.
- Implemented real-time WebSocket orderbook feeds.

Independent Frontend Consultant (Freelance)
Self-Employed / Various Clients | 2021-01 - 2022-12
- Designed and built responsive web applications for 8 high-growth startups.
- Established design systems and reusable Tailwind UI component libraries.

Junior Web Developer (Full-time)
ByteCraft Labs | 2020-01 - 2020-12
- Developed core user registration workflows and email verification systems.`,
    expected: {
      totalYears: 4.5,
      fullTimeYears: 1.0, // Only 2020-01 to 2020-12 is explicitly full_time
      rolesCount: 3,
    },
    targetJobRequirement: {
      minYears: 3,
      blocking: false,
    },
    toleranceYears: 0.3,
    createdAt: "2026-09-07T12:00:00Z",
  },
  {
    id: "fixture-year-only-date-intervals",
    title: "Year-Only Ambiguous Date Formatting (e.g. 2020 - 2023)",
    description:
      "Resumes that omit specific months and only provide calendar years (e.g. '2020 - 2022'). Tests fallback date heuristics.",
    category: "date_formats",
    resumeText: `WORK HISTORY

Full Stack Engineer at Orbit Software
2022 - 2024
Built data visualization tools and automated ETL ingestion pipelines using Python and React.

Junior Web Developer at CyberTech Systems
2020 - 2022
Maintained internal CRM tooling and customer support portals.`,
    expected: {
      totalYears: 4.0,
      fullTimeYears: 4.0,
      rolesCount: 2,
    },
    targetJobRequirement: {
      minYears: 3,
      blocking: true,
    },
    toleranceYears: 0.5,
    createdAt: "2026-09-07T12:00:00Z",
  },
  {
    id: "fixture-ongoing-current-role",
    title: "Active Ongoing Role (Start Date to Present)",
    description:
      "Tests live tenure calculation where current role has no end date ('Present' / 'Current').",
    category: "standard_progression",
    resumeText: `WORK EXPERIENCE

Staff Data Engineer
Starlight Analytics
2023-01 - Present
- Architecting Lakehouse storage solutions on Databricks and Apache Spark.
- Managing a petabyte-scale data warehouse queried by 200+ internal analysts.

Senior BI Developer
Pinnacle Intelligence
2020-06 - 2022-12
- Modeled enterprise dimension schemas in dbt and Snowflake.`,
    expected: {
      totalYears: 5.0, // Approx 2.5 yrs Pinnacle + ~2.5 yrs Starlight through current date
      fullTimeYears: 5.0,
      rolesCount: 2,
    },
    targetJobRequirement: {
      minYears: 4,
      blocking: true,
    },
    toleranceYears: 0.5,
    createdAt: "2026-09-07T12:00:00Z",
  },
  {
    id: "fixture-internship-conversion",
    title: "Internship to Full-Time Staff Conversion",
    description:
      "Tests whether 6-month internship is categorized as 'internship' and differentiated from full-time staff tenure.",
    category: "contract_freelance",
    resumeText: `PROFESSIONAL BACKGROUND

Software Development Engineer
CloudMatrix Technologies
2022-07 - 2024-06 (Full-time)
- Developed resilient distributed background task workers using BullMQ and Redis.
- Implemented automated observability dashboards with Grafana and Prometheus.

Software Engineering Intern
CloudMatrix Technologies
2022-01 - 2022-06 (Internship)
- Assisted backend team in writing unit tests and integrating third-party SMS webhook notifications.`,
    expected: {
      totalYears: 2.5,
      fullTimeYears: 2.0,
      rolesCount: 2,
    },
    targetJobRequirement: {
      minYears: 2,
      blocking: true,
    },
    toleranceYears: 0.2,
    createdAt: "2026-09-07T12:00:00Z",
  },
];
