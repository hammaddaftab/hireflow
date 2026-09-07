export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_EXPERIENCE_FIXTURES } from "@/features/evals/data/defaultFixtures";
import {
  runExperienceEvaluation,
  runBatchExperienceEvaluation,
} from "@/features/evals/services/experienceStressTestService";
import type { ExperienceTestFixture } from "@/features/evals/types";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

const CustomTestSchema = z.object({
  resumeText: z.string().min(10, "Resume text must be at least 10 characters"),
  title: z.string().optional().default("Custom Stress Test"),
  expectedTotalYears: z.number().nonnegative().optional().default(0),
  expectedFullTimeYears: z.number().nonnegative().optional().default(0),
  expectedRolesCount: z.number().int().nonnegative().optional().default(1),
  minYearsRequirement: z.number().nonnegative().optional().default(3),
  blocking: z.boolean().optional().default(true),
  toleranceYears: z.number().nonnegative().optional().default(0.2),
});

const RunPayloadSchema = z.object({
  fixture: z
    .object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.string(),
      resumeText: z.string(),
      expected: z.object({
        totalYears: z.number(),
        fullTimeYears: z.number(),
        rolesCount: z.number(),
        roles: z.array(z.any()).optional(),
      }),
      targetJobRequirement: z.object({
        minYears: z.number(),
        blocking: z.boolean(),
      }),
      toleranceYears: z.number(),
      createdAt: z.string(),
      isCustom: z.boolean().optional(),
    })
    .optional(),
  fixtures: z.array(z.any()).optional(),
  runAll: z.boolean().optional(),
  custom: CustomTestSchema.optional(),
});

// GET /api/evals/experience
// Returns standard preconfigured fixtures
export async function GET() {
  try {
    return createSuccessResponse({
      fixtures: DEFAULT_EXPERIENCE_FIXTURES,
      count: DEFAULT_EXPERIENCE_FIXTURES.length,
      categories: [
        { id: "all", label: "All Fixtures" },
        { id: "user_reported_bug", label: "User Issue (Kaggle)" },
        { id: "standard_progression", label: "Standard Progression" },
        { id: "concurrency_overlap", label: "Concurrent Overlap" },
        { id: "contract_freelance", label: "Contract & Freelance" },
        { id: "date_formats", label: "Date Formats" },
        { id: "custom", label: "Custom Fixtures" },
      ],
    });
  } catch (error) {
    return createErrorResponse(error, "/api/evals/experience");
  }
}

// POST /api/evals/experience
// Runs single fixture or batch stress tests using configured OpenAI provider
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON request body", undefined, "/api/evals/experience");
    }

    const parseResult = RunPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      throw ApiError.badRequest(
        "Invalid stress test payload",
        parseResult.error.errors.map((e) => ({
          name: e.path.join("."),
          reason: e.message,
        })),
        "/api/evals/experience"
      );
    }

    const { fixture, fixtures, runAll, custom } = parseResult.data;

    // Mode 1: Batch suite execution
    if (runAll) {
      const suiteToRun: ExperienceTestFixture[] =
        fixtures && fixtures.length > 0
          ? (fixtures as ExperienceTestFixture[])
          : DEFAULT_EXPERIENCE_FIXTURES;

      const summary = await runBatchExperienceEvaluation(suiteToRun);
      return createSuccessResponse(summary);
    }

    // Mode 2: Custom ad-hoc text run
    if (custom) {
      const adHocFixture: ExperienceTestFixture = {
        id: `fixture-custom-${Date.now()}`,
        title: custom.title,
        description: "Ad-hoc interactive stress test",
        category: "custom",
        resumeText: custom.resumeText,
        expected: {
          totalYears: custom.expectedTotalYears,
          fullTimeYears: custom.expectedFullTimeYears,
          rolesCount: custom.expectedRolesCount,
        },
        targetJobRequirement: {
          minYears: custom.minYearsRequirement,
          blocking: custom.blocking,
        },
        toleranceYears: custom.toleranceYears,
        createdAt: new Date().toISOString(),
        isCustom: true,
      };

      const result = await runExperienceEvaluation(adHocFixture);
      return createSuccessResponse(result);
    }

    // Mode 3: Single fixture execution
    if (fixture) {
      const result = await runExperienceEvaluation(fixture as ExperienceTestFixture);
      return createSuccessResponse(result);
    }

    throw ApiError.badRequest(
      "Must provide either 'fixture', 'custom', or 'runAll: true'",
      undefined,
      "/api/evals/experience"
    );
  } catch (error) {
    return createErrorResponse(error, "/api/evals/experience");
  }
}
