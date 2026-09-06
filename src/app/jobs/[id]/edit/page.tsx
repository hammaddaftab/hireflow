import React from "react";
import { NewJobPage } from "@/features/jobs";

export default async function EditJobRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NewJobPage jobId={id} />;
}
