// Route handler for updating candidate review decision

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reviewsService } from "@/features/review";

const patchDecisionSchema = z.object({
  jobId: z.string().min(1, "jobId is required"),
  decision: z.enum(["keep", "flag", "pass", "pending"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const result = patchDecisionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid decision value or missing jobId",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { jobId, decision, notes } = result.data;
    await reviewsService.upsertDecision(id, jobId, decision, notes);

    return NextResponse.json(
      {
        success: true,
        data: { candidateId: id, jobId, decision, notes },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
