// HireFlow golden demo candidates
// Assembled from modular per-candidate profile definitions in ./mockData/

import type { ParsedCandidateProfile } from "@/entities/candidate";
import { candidate01Tariq } from "./mockData/candidate01Tariq";
import { candidate02Hamza } from "./mockData/candidate02Hamza";
import { candidate03Saad } from "./mockData/candidate03Saad";
import { candidate04Bilal } from "./mockData/candidate04Bilal";
import { candidate05Usman } from "./mockData/candidate05Usman";
import { candidate07Ayesha } from "./mockData/candidate07Ayesha";
import { candidate08Farhan } from "./mockData/candidate08Farhan";
import { candidate09Omer } from "./mockData/candidate09Omer";
import { candidate10Zainab } from "./mockData/candidate10Zainab";
import { GRAD_AI_SWE_CANDIDATES } from "./mockData/gradAiSweCandidates";

export { GRAD_AI_SWE_CANDIDATES };

export const MOCK_CANDIDATES: ParsedCandidateProfile[] = [
  ...GRAD_AI_SWE_CANDIDATES,
  candidate01Tariq,
  candidate02Hamza,
  candidate03Saad,
  candidate04Bilal,
  candidate05Usman,
  candidate07Ayesha,
  candidate08Farhan,
  candidate09Omer,
  candidate10Zainab,
];
