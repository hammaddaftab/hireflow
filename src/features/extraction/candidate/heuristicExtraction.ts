import { createHash, randomUUID } from "node:crypto";
import {
  type ParsedCandidateProfile,
  ParsedCandidateProfileSchema,
} from "@/features/candidates/types";
import { MOCK_CANDIDATES } from "@/features/candidates/mockCandidates";
import {
  type IdentityExtraction,
  type LinkPlatform,
} from "./aspects/identity";
import {
  type WorkHistoryExtraction,
  type EmploymentTypeValue,
  type WorkHistoryEntry,
} from "./aspects/workHistory";
import {
  type EducationExtraction,
  type EducationEntry,
} from "./aspects/education";
import {
  type SkillsDemonstratedExtraction,
  type SkillDemonstratedItem,
} from "./aspects/skillsDemonstrated";
import {
  type SkillsDeclaredExtraction,
} from "./aspects/skillsDeclared";
import {
  type LogisticsExtraction,
} from "./aspects/logistics";
import {
  getCurrentAspectVersions,
} from "./aspects/extractionMetadata";

export interface CandidateFallbackOptions {
  filename?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  fileUrl?: string;
  appliedJobId?: string | null;
  fileHash?: string;
}

/**
 * Helper to match resume text or filename against pre-seeded mock candidates.
 */
export function findMatchingMockCandidate(
  resumeText: string,
  filename?: string
): ParsedCandidateProfile | null {
  const lowerText = resumeText.toLowerCase();
  const lowerFile = filename ? filename.toLowerCase().trim() : "";

  for (const mock of MOCK_CANDIDATES) {
    const mockEmail = mock.identity.email?.toLowerCase();
    const mockFile = mock.source_document.filename.toLowerCase().trim();

    // Match strictly if the exact filename matches or if candidate primary email is present
    if (
      (lowerFile && lowerFile === mockFile) ||
      (mockEmail && lowerText.includes(mockEmail))
    ) {
      return mock;
    }
  }
  return null;
}

/**
 * Heuristic/rule-based parser for candidate identity.
 */
export function extractIdentityHeuristic(lines: string[]): IdentityExtraction {
  let name = "Candidate";
  let email: string | null = null;
  let phone: string | null = null;
  let cnic: string | null = null;
  let rawLocation: string | null = null;
  let detectedCity: string | null = null;
  let detectedProvince: string | null = null;
  const links: { address: string; platform: { raw: string | null; normalized: LinkPlatform | null } }[] = [];

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const phoneRegex = /(?:\+?92[-\s]?|0)?3\d{2}[-\s]?\d{7}|\+?\d{1,3}[-\s]?(?:\(\d{2,4}\)|\d{2,4})[-\s]?\d{3,4}[-\s]?\d{3,4}/;
  const cnicRegex = /\b\d{5}-\d{7}-\d\b/;

  const cityProvinceMap: Record<string, string> = {
    lahore: "Punjab",
    rawalpindi: "Punjab",
    islamabad: "Islamabad Capital Territory",
    karachi: "Sindh",
    faisalabad: "Punjab",
    multan: "Punjab",
    peshawar: "Khyber Pakhtunkhwa",
    quetta: "Balochistan",
    sialkot: "Punjab",
    gujranwala: "Punjab",
  };

  let nameFound = false;

  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Email
    if (!email) {
      const match = line.match(emailRegex);
      if (match) email = match[0];
    }

    // Phone
    if (!phone) {
      const match = line.match(phoneRegex);
      if (match) phone = match[0].replace(/\s+/g, " ");
    }

    // CNIC
    if (!cnic) {
      const match = line.match(cnicRegex);
      if (match) cnic = match[0];
    }

    // Location detection
    const lowerLine = line.toLowerCase();
    for (const [city, province] of Object.entries(cityProvinceMap)) {
      if (!detectedCity && lowerLine.includes(city)) {
        detectedCity = city.charAt(0).toUpperCase() + city.slice(1);
        detectedProvince = province;
        rawLocation = line;
      }
    }
    if (!rawLocation) {
      const addrMatch = line.match(/\b(?:address|location|residence)\s*:\s*(.+)$/i);
      if (addrMatch) {
        rawLocation = addrMatch[1].trim();
      }
    }

    // Links detection
    const urlMatches = line.match(/(?:https?:\/\/|www\.)[^\s|)]+/gi) || [];
    for (const rawUrl of urlMatches) {
      const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
      let platformRaw: string | null = null;
      let platformNorm: LinkPlatform | null = "other";

      if (/linkedin\.com/i.test(url)) {
        platformRaw = "LinkedIn";
        platformNorm = "linkedin";
      } else if (/github\.com/i.test(url)) {
        platformRaw = "GitHub";
        platformNorm = "github";
      } else if (/gitlab\.com/i.test(url)) {
        platformRaw = "GitLab";
        platformNorm = "gitlab";
      } else if (/twitter\.com|x\.com/i.test(url)) {
        platformRaw = "Twitter";
        platformNorm = "twitter";
      } else if (/portfolio/i.test(url)) {
        platformRaw = "Portfolio";
        platformNorm = "portfolio";
      }

      if (!links.some((l) => l.address === url)) {
        links.push({
          address: url,
          platform: { raw: platformRaw, normalized: platformNorm },
        });
      }
    }

    // Name heuristic (clean lines without symbols or metadata keywords)
    if (!nameFound) {
      const isMetadata =
        emailRegex.test(line) ||
        phoneRegex.test(line) ||
        cnicRegex.test(line) ||
        line.includes("http") ||
        line.includes("www.") ||
        /summary|resume|curriculum vitae|experience|contact|education|skills/i.test(line);

      if (!isMetadata) {
        const cleanLine = line.replace(/^[-*•#\d.]+\s*/, "").trim();
        const words = cleanLine.split(/\s+/);
        if (cleanLine.length >= 2 && cleanLine.length <= 45 && words.length >= 1 && words.length <= 5) {
          name = cleanLine;
          nameFound = true;
        }
      }
    }
  }

  return {
    name,
    email,
    phone,
    cnic,
    location: {
      raw: rawLocation,
      normalized: detectedCity
        ? { city: detectedCity, province: detectedProvince }
        : null,
    },
    links,
  };
}

/**
 * Heuristic/rule-based parser for candidate work history.
 */
export function extractWorkHistoryHeuristic(text: string): WorkHistoryExtraction {
  const entries: WorkHistoryEntry[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const expHeaderIndex = lines.findIndex((l) =>
    /^(professional\s+)?experience|work\s+history|employment\s+history/i.test(l)
  );
  const nextSectionIndex = lines.findIndex(
    (l, idx) => idx > expHeaderIndex && /^(education|technical\s+skills|skills|projects|certifications)/i.test(l)
  );

  const relevantLines =
    expHeaderIndex !== -1
      ? lines.slice(expHeaderIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined)
      : lines;

  // Search for date patterns like "2022 - 2024", "Jan 2021 - Present"
  const dateRegex = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(20\d\d|19\d\d)\s*(?:-|–|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(20\d\d|19\d\d|present|current|ongoing|now)?\b/i;

  let currentEntry: Partial<WorkHistoryEntry> | null = null;
  let descBuffer: string[] = [];

  for (let i = 0; i < relevantLines.length; i++) {
    const line = relevantLines[i];
    const dateMatch = line.match(dateRegex);

    if (dateMatch) {
      if (currentEntry) {
        entries.push({
          entry_id: `work_${entries.length + 1}`,
          employer: currentEntry.employer || "Organization",
          title: currentEntry.title || "Role",
          start_date: currentEntry.start_date || "2020",
          end_date: currentEntry.end_date ?? null,
          is_current: currentEntry.is_current ?? false,
          employment_type: currentEntry.employment_type || { value: "full_time", status: "inferred" },
          raw_description: descBuffer.join(" ").trim() || "Professional responsibilities and achievements.",
        });
        descBuffer = [];
      }

      const startYear = dateMatch[2];
      const endPart = dateMatch[4]?.toLowerCase();
      const isCurrent = !endPart || ["present", "current", "ongoing", "now"].includes(endPart);
      const endYear = isCurrent ? null : (endPart?.match(/\d{4}/)?.[0] ?? null);

      // Previous line or current line before date may contain title / employer
      let title = "Engineer";
      let employer = "Company";

      if (i > 0) {
        const prev = relevantLines[i - 1];
        if (prev.length < 60) {
          employer = prev;
        }
      }

      const lineWithoutDate = line.replace(dateRegex, "").replace(/[|•·-]/g, "").trim();
      if (lineWithoutDate.length > 2) {
        title = lineWithoutDate;
      }

      const lowerText = `${title} ${employer}`.toLowerCase();
      let empType: EmploymentTypeValue = "full_time";
      let empStatus: "confirmed" | "inferred" = "inferred";

      if (lowerText.includes("intern")) {
        empType = "internship";
        empStatus = "confirmed";
      } else if (lowerText.includes("contract")) {
        empType = "contract";
        empStatus = "confirmed";
      } else if (lowerText.includes("freelance")) {
        empType = "freelance";
        empStatus = "confirmed";
      }

      currentEntry = {
        employer,
        title,
        start_date: startYear,
        end_date: endYear,
        is_current: isCurrent,
        employment_type: { value: empType, status: empStatus },
      };
    } else if (currentEntry) {
      descBuffer.push(line);
    }
  }

  if (currentEntry) {
    entries.push({
      entry_id: `work_${entries.length + 1}`,
      employer: currentEntry.employer || "Organization",
      title: currentEntry.title || "Role",
      start_date: currentEntry.start_date || "2020",
      end_date: currentEntry.end_date ?? null,
      is_current: currentEntry.is_current ?? false,
      employment_type: currentEntry.employment_type || { value: "full_time", status: "inferred" },
      raw_description: descBuffer.join(" ").trim() || "Professional responsibilities and achievements.",
    });
  }

  return { entries };
}

/**
 * Heuristic/rule-based parser for candidate education.
 */
export function extractEducationHeuristic(text: string): EducationExtraction {
  const entries: EducationEntry[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const eduHeaderIndex = lines.findIndex((l) => /^(education|academic\s+background|qualification)/i.test(l));
  const nextSectionIndex = lines.findIndex(
    (l, idx) => idx > eduHeaderIndex && /^(experience|skills|projects|certifications)/i.test(l)
  );

  const relevantLines =
    eduHeaderIndex !== -1
      ? lines.slice(eduHeaderIndex + 1, nextSectionIndex !== -1 ? nextSectionIndex : undefined)
      : lines;

  for (let i = 0; i < relevantLines.length; i++) {
    const line = relevantLines[i];
    const lower = line.toLowerCase();

    let degreeLevel: "bachelors" | "masters" | "doctorate" | "diploma" | "high_school" | null = null;
    if (/\b(bachelor|bs|bsc|b\.s|b\.e|bba|software engineering|computer science)\b/i.test(line)) {
      degreeLevel = "bachelors";
    } else if (/\b(master|ms|msc|m\.s|mphil|mba)\b/i.test(line)) {
      degreeLevel = "masters";
    } else if (/\b(phd|doctorate|doctor of philosophy)\b/i.test(line)) {
      degreeLevel = "doctorate";
    } else if (/\b(dae|diploma|associate degree)\b/i.test(line)) {
      degreeLevel = "diploma";
    } else if (/\b(fsc|ics|matric|o-levels|a-levels|intermediate|high school)\b/i.test(line)) {
      degreeLevel = "high_school";
    }

    if (degreeLevel) {
      const yearMatch = line.match(/\b(20\d\d|19\d\d)\b/g);
      const startYear = yearMatch ? yearMatch[0] : null;
      const endYear = yearMatch && yearMatch.length > 1 ? yearMatch[1] : startYear;

      let institutionRaw = "University / Institution";
      if (i + 1 < relevantLines.length && relevantLines[i + 1].length < 80) {
        institutionRaw = relevantLines[i + 1];
      }

      entries.push({
        institution: {
          raw: institutionRaw,
          normalized: institutionRaw,
        },
        degree_level: {
          raw: line,
          normalized: degreeLevel,
        },
        field: {
          raw: lower.includes("computer") ? "Computer Science" : lower.includes("mechanical") ? "Mechanical Engineering" : "General",
          normalized: lower.includes("computer") ? "Computer Science" : lower.includes("mechanical") ? "Mechanical Engineering" : null,
        },
        start_date: startYear,
        end_date: endYear,
        is_current: false,
        grade: null,
      });
    }
  }

  return { entries };
}

/**
 * Heuristic/rule-based parser for declared skills.
 */
export function extractSkillsDeclaredHeuristic(text: string): SkillsDeclaredExtraction {
  const skillsSet = new Set<string>();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const skillsHeaderIndex = lines.findIndex((l) => /^(technical\s+)?skills|technologies|tools|competencies/i.test(l));
  const nextSectionIndex = lines.findIndex(
    (l, idx) =>
      idx > skillsHeaderIndex &&
      /^(experience|work\s+history|employment|education|projects|certifications|references|salary|compensation|notice|logistics|languages|contact|personal|interests|hobbies)/i.test(
        l
      )
  );

  const relevantLines =
    skillsHeaderIndex !== -1
      ? lines.slice(
          skillsHeaderIndex + 1,
          nextSectionIndex !== -1 ? nextSectionIndex : Math.min(lines.length, skillsHeaderIndex + 15)
        )
      : [];

  for (const line of relevantLines) {
    if (/^[a-z\s]+:$/i.test(line)) continue;
    const tokens = line
      .split(/[,|•·;\t/]/)
      .map((t) => t.replace(/^[-*•]\s*/, "").trim())
      .filter(
        (t) =>
          t.length > 1 &&
          t.length < 35 &&
          !/summary|experience|education|phone|email|salary|notice|relocate|available|present|address|linkedin|github|pkr|usd/i.test(
            t
          )
      );

    tokens.forEach((tok) => skillsSet.add(tok));
  }

  // Common technical keywords fallback if section parsing extracted few items
  const commonTech = [
    "Python", "TypeScript", "JavaScript", "React", "Next.js", "Node.js",
    "Docker", "PostgreSQL", "MongoDB", "MySQL", "Git", "FastAPI",
    "Tailwind CSS", "Linux", "REST APIs", "GraphQL", "AWS", "Machine Learning",
    "PyTorch", "TensorFlow", "Pandas", "NumPy", "C++", "Java", "Redis", "Kafka"
  ];

  const searchScope = relevantLines.length > 0 ? relevantLines.join(" ") : "";
  for (const tech of commonTech) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (searchScope && regex.test(searchScope)) {
      skillsSet.add(tech);
    }
  }

  return {
    skills_declared: Array.from(skillsSet).slice(0, 30),
  };
}

/**
 * Heuristic/rule-based parser for skills demonstrated from work history.
 */
export function extractSkillsDemonstratedHeuristic(
  workHistory: WorkHistoryExtraction,
  skillsDeclared: SkillsDeclaredExtraction
): SkillsDemonstratedExtraction {
  const demonstrated: SkillDemonstratedItem[] = [];
  const candidateSkillsSet = new Set<string>(skillsDeclared.skills_declared);
  const commonDemonstratedTech = [
    "Python", "TypeScript", "JavaScript", "React", "Next.js", "Node.js",
    "Docker", "PostgreSQL", "MongoDB", "MySQL", "Git", "FastAPI",
    "Tailwind CSS", "Linux", "REST APIs", "GraphQL", "AWS", "Machine Learning",
    "PyTorch", "TensorFlow", "Pandas", "NumPy", "C++", "Java", "Redis", "Kafka"
  ];
  for (const tech of commonDemonstratedTech) {
    candidateSkillsSet.add(tech);
  }
  const skillsToCheck = Array.from(candidateSkillsSet);

  const actionVerbs = /\b(built|architected|designed|developed|implemented|engineered|created|deployed|led|optimized|streamlined|managed)\b/i;
  const peripheralVerbs = /\b(assisted|worked with|supported|familiar|contributed|utilized)\b/i;

  for (const entry of workHistory.entries) {
    const desc = entry.raw_description;
    const sentences = desc.split(/[.!?\n]/).map((s) => s.trim()).filter((s) => s.length > 5);

    for (const skill of skillsToCheck) {
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

      for (const sentence of sentences) {
        if (skillRegex.test(sentence)) {
          let tier: "action_attributed" | "peripheral_action" | "context_listed" = "context_listed";
          let status: "confirmed" | "ambiguous" = "ambiguous";

          if (actionVerbs.test(sentence)) {
            tier = "action_attributed";
            status = "confirmed";
          } else if (peripheralVerbs.test(sentence)) {
            tier = "peripheral_action";
            status = "ambiguous";
          }

          // Check for metrics or outcomes
          const outcomeMatch = sentence.match(/\b(?:\d+%\s*(?:latency|reduction|increase|improvement)?|\d+M\b|cutting\s+\w+\s+by\s+\d+%|reduced\s+\w+\s+by\s+\d+%)/i);

          demonstrated.push({
            skill,
            source_entry_ref: entry.entry_id,
            syntactic_tier: tier,
            outcome_attached: outcomeMatch ? outcomeMatch[0] : null,
            concrete_noun_present: true,
            evidence_span: sentence,
            evidence_status: status,
          });
          break; // Avoid duplicating same skill multiple times per entry
        }
      }
    }
  }

  return { skills: demonstrated.slice(0, 20) };
}

/**
 * Heuristic/rule-based parser for candidate logistics.
 */
export function extractLogisticsHeuristic(text: string): LogisticsExtraction {
  let salaryRaw: string | null = null;
  let salaryMin: number | null = null;
  let salaryMax: number | null = null;
  let salaryCurrency: string | null = null;

  const salaryMatch = text.match(/(?:salary|compensation|expected)?\s*(?:(?:PKR|USD|Rs\.?|\$)\s*([\d,]+)(?:\s*(?:-|to)\s*([\d,]+))?)/i);
  if (salaryMatch) {
    salaryRaw = salaryMatch[0].trim();
    const currMatch = salaryRaw.match(/PKR|USD|Rs|\$/i);
    salaryCurrency = currMatch ? (currMatch[0] === "$" ? "USD" : currMatch[0].toUpperCase()) : "PKR";
    salaryMin = parseInt(salaryMatch[1].replace(/,/g, ""), 10) || null;
    salaryMax = salaryMatch[2] ? parseInt(salaryMatch[2].replace(/,/g, ""), 10) : salaryMin;
  }

  let noticeRaw: string | null = null;
  let noticeValue: number | null = null;
  let noticeUnit: "days" | "weeks" | "months" | null = null;

  const noticeMatch = text.match(/\b(\d+)\s*(days?|weeks?|months?)\s*(?:notice|period)?\b/i);
  if (noticeMatch) {
    noticeRaw = noticeMatch[0].trim();
    noticeValue = parseInt(noticeMatch[1], 10);
    const u = noticeMatch[2].toLowerCase();
    noticeUnit = u.startsWith("month") ? "months" : u.startsWith("week") ? "weeks" : "days";
  } else if (/\bimmediate\b/i.test(text)) {
    noticeRaw = "immediate";
    noticeValue = 0;
    noticeUnit = "days";
  }

  const languages: string[] = [];
  const candidateLangs = ["English", "Urdu", "Punjabi", "Sindhi", "Pashto", "Arabic", "German", "French"];
  for (const lang of candidateLangs) {
    if (new RegExp(`\\b${lang}\\b`, "i").test(text)) {
      languages.push(lang);
    }
  }
  if (languages.length === 0) {
    languages.push("English");
  }

  return {
    salary_expectation: {
      raw: salaryRaw,
      normalized: salaryMin !== null
        ? { min: salaryMin, max: salaryMax, currency: salaryCurrency }
        : null,
    },
    notice_period: {
      raw: noticeRaw,
      normalized: noticeValue !== null
        ? { value: noticeValue, unit: noticeUnit }
        : null,
    },
    stated_relocation_willingness: /\bwilling\s+to\s+relocate\b/i.test(text) ? "willing" : "not_stated",
    stated_availability: /\bimmediate(?:ly)?\s+available\b|\bimmediate\b/i.test(text)
      ? "immediate"
      : noticeRaw || "not_stated",
    languages,
  };
}

/**
 * Deterministic fallback extractor combining heuristic parsing and mock resolution.
 */
export function extractCandidateFallback(
  resumeText: string,
  options?: CandidateFallbackOptions,
  warnings: string[] = []
): ParsedCandidateProfile {
  const fileHash =
    options?.fileHash ?? createHash("sha256").update(resumeText).digest("hex");
  const filename = options?.filename || "resume.pdf";
  const appliedJobId = options?.appliedJobId ?? null;

  // Check if text matches known mock candidate
  const mockMatch = findMatchingMockCandidate(resumeText, filename);
  if (mockMatch) {
    const freshProfile: ParsedCandidateProfile = {
      ...mockMatch,
      id: `cand_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      applied_job_id: appliedJobId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_document: {
        filename,
        file_size_bytes: options?.fileSizeBytes ?? mockMatch.source_document.file_size_bytes,
        mime_type: options?.mimeType ?? mockMatch.source_document.mime_type,
        url: options?.fileUrl,
      },
      extraction_metadata: {
        ...mockMatch.extraction_metadata,
        file_hash: fileHash,
        aspect_versions: getCurrentAspectVersions(),
        extracted_at: new Date().toISOString(),
        raw_text_ref: options?.fileUrl || `storage://resumes/${filename}`,
        warnings,
      },
    };

    return ParsedCandidateProfileSchema.parse(freshProfile);
  }

  // Heuristic extraction
  const lines = resumeText.split("\n");
  const identity = extractIdentityHeuristic(lines);
  const workHistory = extractWorkHistoryHeuristic(resumeText);
  const education = extractEducationHeuristic(resumeText);
  const skillsDeclared = extractSkillsDeclaredHeuristic(resumeText);
  const skillsDemonstrated = extractSkillsDemonstratedHeuristic(workHistory, skillsDeclared);
  const logistics = extractLogisticsHeuristic(resumeText);

  const parseQuality =
    identity.name !== "Candidate" && (workHistory.entries.length > 0 || education.entries.length > 0)
      ? "full"
      : "partial";

  const profile: ParsedCandidateProfile = {
    id: `cand_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    applied_job_id: appliedJobId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_document: {
      filename,
      file_size_bytes: options?.fileSizeBytes,
      mime_type: options?.mimeType || "application/pdf",
      url: options?.fileUrl,
    },
    identity,
    work_history: workHistory,
    education,
    skills_demonstrated: skillsDemonstrated,
    skills_declared: skillsDeclared,
    logistics,
    extraction_metadata: {
      file_hash: fileHash,
      aspect_versions: getCurrentAspectVersions(),
      extracted_at: new Date().toISOString(),
      parse_quality: parseQuality,
      raw_text_ref: options?.fileUrl || `storage://resumes/${filename}`,
      warnings,
    },
  };

  return ParsedCandidateProfileSchema.parse(profile);
}
