// Universal extraction and normalization public API facade

export * from "./catalogs/canonicalSkills";
export * from "./catalogs/entityCatalog";
export * from "./catalogs/fetchUniversities";
export * from "./normalizers/fieldOfStudyNormalizer";
export * from "./normalizers/locationNormalizer";
export * from "./normalizers/skillNormalizer";
export * from "./normalizers/universityNormalizer";
export * from "./normalizers/normalizeCandidateProfile";
export * from "./pipeline/candidateExtractionService";
export * from "./pipeline/heuristicExtraction";
export * from "./pipeline/extractCandidateFromDocument";
