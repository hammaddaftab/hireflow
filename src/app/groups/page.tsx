import React from "react";
import type { Metadata } from "next";
import { GroupsExplorerView } from "@/features/groups/components/GroupsExplorerView";

export const metadata: Metadata = {
  title: "Candidate Groups Topology - HireFlow",
  description: "Interactive node graph of candidate groups with viewport navigation and dealbreaker clustering.",
};

export default function GroupsPage() {
  return <GroupsExplorerView />;
}
