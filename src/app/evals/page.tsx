import { notFound, redirect } from "next/navigation";
import { FEATURES } from "@/config/features";

export default function EvalsRootPage() {
  if (!FEATURES.AI_EVALS) {
    notFound();
  }
  redirect("/evals/experience");
}
