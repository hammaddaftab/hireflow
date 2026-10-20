import { NextResponse } from "next/server";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "healthy",
      service: "hireflow-api",
      version: "0.1.0",
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}
