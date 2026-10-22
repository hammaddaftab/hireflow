# (1) Demo Candidates

- 4 Islamabad, 2 Lahore, 2 Karachi, 1 Rawalpindi, 1 with no city
- for links: 8 people having at least 2 links
- Institutions (4 NUST / 4 FAST / 1 GIKI / 1 unspecified)

Here's the revised set of 10. It's built so the queue lands at about 3 fast-clear, 4 second-look and 3 contradicted, so every status filter shows a real count.

| # | Resume | Built to show | Expected landing |
|---|---|---|---|
| 1 | Clean strong match | Action verbs, outcomes with numbers, all logistics stated. This is your opening card and the Layer 2 evidence showcase. | Fast-clear |
| 2 | Hidden gem | Terse, no tidy skills section, and writes "NodeJS", "Postgres" and "Amazon Web Services", never the literal canonical strings. Strong demonstrated work. | Fast-clear |
| 3 | Keyword stuffer | The mirror of #2: every required skill listed literally in a skills section, no narrative evidence behind any of them. | Second look (declared-only skills, high orphan count) |
| 4 | Adjacent stack | Strong 5-year Java engineer with no JavaScript or Node anywhere. Shows the system doesn't false-match java/javascript. | Second look (required skills not stated) |
| 5 | Near-miss | About 3.6 years against a 4+ requirement, with excellent evidence. The gap is shown, not a rejection, and the recruiter can still Keep. | Contradicted tab (years gap) |
| 6 | Padded junior | Headline claims 4+ years, but dates show about 14 months full-time plus internships. Also has an in-progress master's, so the In Progress tag appears. | Contradicted tab (verified years far below) |
| 7 | Logistics-silent | Strong confirmed skills, no salary, notice period or relocation stated, and no city, so the Unspecified bucket is populated. | Second look |
| 8 | Great but out of band | Strong evidence, salary above the band, 90-day notice. Two deterministic contradictions on an otherwise good candidate. | Contradicted tab |
| 9 | Realistic mixed | Node and TypeScript confirmed with outcomes, PostgreSQL only "worked with" (peripheral), AWS only in the skills list (orphan). Three evidence qualities on one card. | Second look |
| 10 | Misses only a preferred skill | All blocking confirmed, no Redis. Shows that preferred isn't blocking. | Fast-clear |




# (2) Requiremens Update

```ts
export const INITIAL_JOBS: Job[] = [
  {
    id: "job-sample-1",
    title: "Backend Engineer (Go)",
    department: "Engineering",
    location: "Islamabad, Pakistan (Hybrid)",
    employmentType: "full-time",
    description:
      "We run the order-routing and settlement backend for a growing logistics platform. " +
      "You will own Go services end to end: API design, PostgreSQL schema evolution, and containerised deployments, " +
      "working with a small team in Islamabad on a hybrid schedule. " +
      "We care more about what you shipped and what it changed than about how many tools you list.",
    seniority_level: "Mid-Senior",
    skills_required: [
      { active: true, skill: normalizeSkill("Go"), blocking: true },
      { active: true, skill: normalizeSkill("PostgreSQL"), blocking: true },
      { active: true, skill: normalizeSkill("Docker"), blocking: true },
      { active: true, skill: normalizeSkill("REST API"), blocking: true },
    ],
    skills_preferred: [
      { active: true, skill: normalizeSkill("Linux"), blocking: false },
      { active: true, skill: normalizeSkill("Kubernetes"), blocking: false },
      { active: true, skill: normalizeSkill("AWS"), blocking: false },
      { active: true, skill: normalizeSkill("Redis"), blocking: false },
      { active: true, skill: normalizeSkill("gRPC"), blocking: false },
      { active: true, skill: normalizeSkill("Apache Kafka"), blocking: false },
    ],
    min_experience: { active: true, years: 4, blocking: true },
    education_min: {
      active: true,
      degree_level: "bachelors",
      field: normalizeFieldOfStudy("Computer Science"),
      blocking: false,
    },
    location_requirement: {
      active: true,
      city: "Islamabad",
      province: "Islamabad Capital Territory",
      blocking: false,
    },
    work_mode: { active: false, mode: "hybrid", blocking: false },
    compensation_band: { active: true, min: 300000, max: 450000, currency: "PKR", blocking: true },
    max_notice_period: { active: true, value: 30, unit: "days", blocking: true },
    status: "active",
    createdAt: new Date("2026-08-28T10:00:00.000Z"),
    updatedAt: new Date("2026-08-28T10:00:00.000Z"),
  },
];
```

**What changed and why**

- **Required skills went from 11 to 4.** With 15 blocking items in total, a candidate needed every one confirmed to be fast-clear, so almost nobody would be, and the strip would be a wall of pills. It's now 7 blocking items (4 skills, experience, notice, compensation). The glanceable ceiling of about 7 is my design judgment, not something I measured.
- **I dropped Agile, Code Review, Distributed Systems and Concurrency & Multithreading.** The evidence pipeline is built around tools named with an action verb. Practices and concepts will land as not_stated for almost every resume on a blocking row, which adds noise and no signal. The "&" and "/" in some names are also normalization edge cases.
- **Preferred went from 10 to 6, and each one has a job in the demo.** Linux moved down from required. Kubernetes tests the k8s alias. AWS tests Amazon Web Services and the declared-only state. Redis is the one the resume that misses only a preferred skill leaves out. gRPC and Kafka round out the list.
- **Compensation changed from USD 600–800 non-blocking to PKR 300,000–450,000 blocking.** Candidates will state PKR, and comparing across currencies is a bug source. It's blocking so the comparison appears in the strip. The schema has no period field, so every stated figure on every resume must be monthly. The range is a placeholder, so sanity-check it against comparable Rozee listings.
- **Notice period is now active, at 30 days or less and blocking.** It was inactive, which made the not-stated-notice and 90-day-notice demos impossible.
- **Location is non-blocking.** The city menu does the narrowing. A blocking Islamabad requirement would push every other city into Contradicted and distort the queue.
- **work_mode is inactive.** The candidate schema has no work-mode field, and the evaluator's status type has no `not_stated`. That suggests it infers when data is missing, which breaks your never-infer rule. An onsite requirement would also double-count the city check.
- **Education is non-blocking.** SE-vs-CS relatedness is unresolved, and BS Software Engineering is common at both FAST and NUST. A blocking field requirement would create false contradictions.
- **Smaller changes.** The title now says (Go), and the description and seniority are filled in. A null description looks unfinished on stage. I didn't add per-skill `min_years` because the Job type as pasted has no such field.

**Check these before relying on it** (I can't see the evaluators, so none of these can be verified from the analysis doc)
1. **"Go" is a 2-character skill.** Confirm it matches only as an exact alias (Go, Golang), never through fuzzy or substring rules. Feed it a resume mentioning Django, MongoDB and Google Cloud and confirm none produce a Go match.
2. **Does `hasContradicted` count non-blocking items?** If it does, every non-Islamabad candidate lands in the Contradicted tab regardless of the blocking flag, and your tab distribution shifts.
3. **Currency mismatch handling.** If the evaluator compares raw numbers across currencies, a resume stating 600 USD silently reads as far below a PKR 300,000 band.
4. **Islamabad province string.** If the evaluator compares province, the candidate-side normalized value for Islamabad must be exactly "Islamabad Capital Territory".

**What this does to the 10 resumes (the earlier table was Node/TS-based)**
- **#1:** Go, Postgres, Docker and REST with outcomes. Salary in band, notice 15–30 days.
- **#2:** writes "Golang", "Postgres", "RESTful APIs" and "Amazon Web Services". Same salary and notice constraints as #1.
- **#3:** lists all four required skills literally plus the preferred ones, with no narrative evidence.
- **#4:** Java/Spring engineer with Docker, PostgreSQL and REST confirmed and no Go anywhere.
- **#5:** 3.6 years, otherwise strong.
- **#6:** claims 4+ years, with about 14 months of verified full-time experience.
- **#7:** no salary, no notice period, no city.
- **#8:** strong evidence, PKR 600,000, 90-day notice.
- **#9:** Go and Docker confirmed with outcomes, PostgreSQL only "worked with", REST API and AWS only in the skills list.
- **#10:** all four required skills and all logistics fine, no Redis.

The expected queue split (3 fast-clear, 4 second-look, 3 contradicted) still holds, and cities are free to vary as long as check 2 passes. The java/javascript collision case is gone from the demo, because a blocklist that works is invisible. You'd just see "not stated", the same as any candidate who didn't mention it. Keep it as a unit test.