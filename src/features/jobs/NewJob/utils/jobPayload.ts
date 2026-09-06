import { produce } from "immer";
import type { FormFieldState, CreateJobInput } from "@/features/jobs/types";
import type { Job } from "@/entities/job";

// Parses comma-separated skill strings into trimmed arrays
export function parseSkillStrings(value: string | number | undefined): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Populates form fields from an existing job record using Immer produce
export function populateFieldsFromJob(
  job: Job,
  baseFields: Record<string, FormFieldState>
): Record<string, FormFieldState> {
  return produce(baseFields, (draft) => {
    if (draft.minExperience && job.min_experience) {
      const exp = job.min_experience;
      draft.minExperience.value = "years" in exp && typeof exp.years === "number" ? exp.years : 0;
      draft.minExperience.mode = exp.blocking ? "hard" : "soft";
      draft.minExperience.active = exp.active !== false;
    }
    if (draft.skillsRequired && job.skills_required) {
      const skills = job.skills_required
        .map((s) => ("skill" in s && typeof s.skill === "string" ? s.skill : ""))
        .filter(Boolean);
      draft.skillsRequired.value = skills.join(", ");
      draft.skillsRequired.mode = job.skills_required.some((s) => s.blocking) ? "hard" : "soft";
      draft.skillsRequired.active =
        job.skills_required.length > 0 ? job.skills_required.some((s) => s.active !== false) : false;
    }
    if (draft.skillsPreferred && job.skills_preferred) {
      const skills = job.skills_preferred
        .map((s) => ("skill" in s && typeof s.skill === "string" ? s.skill : ""))
        .filter(Boolean);
      draft.skillsPreferred.value = skills.join(", ");
      draft.skillsPreferred.mode = job.skills_preferred.some((s) => s.blocking) ? "hard" : "soft";
      draft.skillsPreferred.active =
        job.skills_preferred.length > 0 ? job.skills_preferred.some((s) => s.active !== false) : false;
    }
    if (draft.degreeLevel && job.education_min) {
      const edu = job.education_min;
      draft.degreeLevel.value =
        "degree_level" in edu && typeof edu.degree_level === "string" ? edu.degree_level : "none";
      draft.degreeLevel.mode = edu.blocking ? "hard" : "soft";
      draft.degreeLevel.active = edu.active !== false;
    }
    if (draft.fieldOfStudy && job.education_min) {
      const edu = job.education_min;
      draft.fieldOfStudy.value = "field" in edu && typeof edu.field === "string" ? edu.field : "";
      draft.fieldOfStudy.mode = edu.blocking ? "hard" : "soft";
      draft.fieldOfStudy.active = edu.active !== false;
    }
    if (draft.locationCity && job.location_requirement) {
      const loc = job.location_requirement;
      draft.locationCity.value = "city" in loc && typeof loc.city === "string" ? loc.city : "Any";
      draft.locationCity.mode = loc.blocking ? "hard" : "soft";
      draft.locationCity.active = loc.active !== false;
    }
    if (draft.locationProvince && job.location_requirement) {
      const loc = job.location_requirement;
      draft.locationProvince.value =
        "province" in loc && typeof loc.province === "string" ? loc.province : "Any";
      draft.locationProvince.mode = loc.blocking ? "hard" : "soft";
      draft.locationProvince.active = loc.active !== false;
    }
    if (draft.workMode && job.work_mode) {
      const wm = job.work_mode;
      draft.workMode.value = "mode" in wm && typeof wm.mode === "string" ? wm.mode : "hybrid";
      draft.workMode.mode = wm.blocking ? "hard" : "soft";
      draft.workMode.active = wm.active !== false;
    }
    if (draft.compensationMin && job.compensation_band) {
      const cb = job.compensation_band;
      draft.compensationMin.value = "min" in cb && typeof cb.min === "number" ? cb.min : 400000;
      draft.compensationMin.mode = cb.blocking ? "hard" : "soft";
      draft.compensationMin.active = cb.active !== false;
    }
    if (draft.compensationMax && job.compensation_band) {
      const cb = job.compensation_band;
      draft.compensationMax.value = "max" in cb && typeof cb.max === "number" ? cb.max : 600000;
      draft.compensationMax.mode = cb.blocking ? "hard" : "soft";
      draft.compensationMax.active = cb.active !== false;
    }
    if (draft.compensationCurrency && job.compensation_band) {
      const cb = job.compensation_band;
      draft.compensationCurrency.value =
        "currency" in cb && typeof cb.currency === "string" ? cb.currency : "PKR";
      draft.compensationCurrency.mode = cb.blocking ? "hard" : "soft";
      draft.compensationCurrency.active = cb.active !== false;
    }
    if (draft.noticePeriod && job.max_notice_period) {
      const np = job.max_notice_period;
      draft.noticePeriod.value = "value" in np && typeof np.value === "number" ? np.value : 30;
      draft.noticePeriod.mode = np.blocking ? "hard" : "soft";
      draft.noticePeriod.active = np.active !== false;
    }
    if (draft.noticePeriodUnit && job.max_notice_period) {
      const np = job.max_notice_period;
      draft.noticePeriodUnit.value = "unit" in np && typeof np.unit === "string" ? np.unit : "days";
      draft.noticePeriodUnit.mode = np.blocking ? "hard" : "soft";
      draft.noticePeriodUnit.active = np.active !== false;
    }
  });
}

// Transforms UI form fields into canonical CreateJobInput payload
export function buildJobPayload(
  title: string,
  department: string,
  fields: Record<string, FormFieldState>
): CreateJobInput {
  const mandatorySkillsList = parseSkillStrings(fields.skillsRequired?.value);
  const preferredSkillsList = parseSkillStrings(fields.skillsPreferred?.value);
  const degreeValue = String(fields.degreeLevel?.value || "none");
  const validDegree =
    degreeValue === "none"
      ? null
      : (degreeValue as "bachelors" | "masters" | "doctorate" | "diploma" | "high_school");

  const workModeValue = String(fields.workMode?.value || "hybrid") as "onsite" | "hybrid" | "remote";
  const noticeUnitValue = String(fields.noticePeriodUnit?.value || "days") as "days" | "weeks" | "months";

  const location = (() => {
    const c =
      fields.locationCity?.value && fields.locationCity.value !== "Any"
        ? String(fields.locationCity.value).trim()
        : null;
    const p =
      fields.locationProvince?.value && fields.locationProvince.value !== "Any"
        ? String(fields.locationProvince.value).trim()
        : null;
    if (c && p) return `${c}, ${p}`;
    if (c) return c;
    if (p) return `${p}, Pakistan`;
    return "Flexible / Remote";
  })();

  return {
    title,
    department,
    location,
    employmentType: "full-time",
    // TODO: Remove description and seniority_level from database schema and migrations in a future full schema cleanup
    description: null,
    seniority_level: null,

    skills_required: mandatorySkillsList.map((skill) =>
      fields.skillsRequired?.active === false
        ? { active: false as const, blocking: fields.skillsRequired?.mode === "hard" }
        : { active: true as const, skill, blocking: fields.skillsRequired?.mode === "hard" }
    ),
    skills_preferred: preferredSkillsList.map((skill) =>
      fields.skillsPreferred?.active === false
        ? { active: false as const, blocking: fields.skillsPreferred?.mode === "hard" }
        : { active: true as const, skill, blocking: fields.skillsPreferred?.mode === "hard" }
    ),
    min_experience:
      fields.minExperience?.active === false
        ? { active: false as const, blocking: fields.minExperience?.mode === "hard" }
        : {
            active: true as const,
            years: Number(fields.minExperience?.value) || 0,
            blocking: fields.minExperience?.mode === "hard",
          },
    education_min:
      fields.degreeLevel?.active === false
        ? { active: false as const, blocking: fields.degreeLevel?.mode === "hard" }
        : {
            active: true as const,
            degree_level: validDegree,
            field:
              fields.fieldOfStudy?.value && fields.fieldOfStudy.value !== "Any"
                ? String(fields.fieldOfStudy.value).trim()
                : null,
            blocking: fields.degreeLevel?.mode === "hard",
          },
    location_requirement:
      fields.locationCity?.active === false
        ? { active: false as const, blocking: fields.locationCity?.mode === "hard" }
        : {
            active: true as const,
            city:
              fields.locationCity?.value && fields.locationCity.value !== "Any"
                ? String(fields.locationCity.value).trim()
                : null,
            province:
              fields.locationProvince?.value && fields.locationProvince.value !== "Any"
                ? String(fields.locationProvince.value).trim()
                : null,
            blocking: fields.locationCity?.mode === "hard",
          },
    work_mode:
      fields.workMode?.active === false
        ? { active: false as const, blocking: fields.workMode?.mode === "hard" }
        : {
            active: true as const,
            mode: workModeValue,
            blocking: fields.workMode?.mode === "hard",
          },
    compensation_band:
      fields.compensationMax?.active === false
        ? { active: false as const, blocking: fields.compensationMax?.mode === "hard" }
        : {
            active: true as const,
            min: Number(fields.compensationMin?.value) || null,
            max: Number(fields.compensationMax?.value) || null,
            currency: String(fields.compensationCurrency?.value || "PKR"),
            blocking: fields.compensationMax?.mode === "hard",
          },
    max_notice_period:
      fields.noticePeriod?.active === false
        ? { active: false as const, blocking: fields.noticePeriod?.mode === "hard" }
        : {
            active: true as const,
            value: Number(fields.noticePeriod?.value) || null,
            unit: noticeUnitValue,
            blocking: fields.noticePeriod?.mode === "hard",
          },
    status: "active",
  };
}
