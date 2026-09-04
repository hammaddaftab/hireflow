import { z } from "zod";
import { IdentityExtractionSchema } from "../extraction/candidate/aspects/identity";
import { WorkHistoryExtractionSchema } from "../extraction/candidate/aspects/workHistory";
import { EducationExtractionSchema } from "../extraction/candidate/aspects/education";
import { SkillsDemonstratedExtractionSchema } from "../extraction/candidate/aspects/skillsDemonstrated";
import { SkillsDeclaredExtractionSchema } from "../extraction/candidate/aspects/skillsDeclared";
import { LogisticsExtractionSchema } from "../extraction/candidate/aspects/logistics";
import { ExtractionMetadataSchema } from "../extraction/candidate/aspects/extractionMetadata";

/**
 * Full candidate profile matching the exact multi-aspect extraction output.
 * Contains purely the extracted candidate data — no synthetic scores or terminal classifications.
 */
export const ParsedCandidateProfileSchema = z.object({
  id: z.string().describe("Unique candidate identifier, e.g. 'cand_1'"),
  applied_job_id: z.string().nullable().optional().describe("Associated job ID if applied directly"),
  created_at: z.string().describe("ISO timestamp when candidate record was created"),
  updated_at: z.string().describe("ISO timestamp when candidate record was last updated"),
  source_document: z.object({
    filename: z.string(),
    file_size_bytes: z.number().optional(),
    mime_type: z.string().default("application/pdf"),
    url: z.string().optional(),
  }),
  identity: IdentityExtractionSchema,
  work_history: WorkHistoryExtractionSchema,
  education: EducationExtractionSchema,
  skills_demonstrated: SkillsDemonstratedExtractionSchema,
  skills_declared: SkillsDeclaredExtractionSchema,
  logistics: LogisticsExtractionSchema,
  extraction_metadata: ExtractionMetadataSchema,
});

export type ParsedCandidateProfile = z.infer<typeof ParsedCandidateProfileSchema>;
