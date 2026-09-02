import { NextResponse } from "next/server";

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
