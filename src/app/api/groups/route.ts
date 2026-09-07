// API route for querying and creating persisted candidate groups and subgroups

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { groupsService } from "@/features/groups/groupsService";

const createGroupSchema = z.object({
  jobId: z.string().optional(),
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  candidateIds: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId query parameter is required" },
        { status: 400 }
      );
    }

    const groups = await groupsService.getGroupsForJob(jobId);
    return NextResponse.json({ success: true, data: groups }, { status: 200 });
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

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const result = createGroupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const group = await groupsService.createGroup(result.data);
    return NextResponse.json({ success: true, data: group }, { status: 201 });
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
