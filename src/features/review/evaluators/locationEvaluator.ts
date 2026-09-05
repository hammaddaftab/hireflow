import type { LocationRequirement } from "@/entities/job";
import type { NormalizedLocation } from "@/entities/extraction/candidate/aspects/identity";
import type { EvaluatedLocationRequirement, LocationStatus } from "./evaluationStatuses";

export type LocationEvaluatorInput = {
  location_requirement: LocationRequirement | null;
  normalized_location: NormalizedLocation;
  stated_relocation_willingness?: string | null;
  id?: string;
};

export function evaluateLocation(input: LocationEvaluatorInput): EvaluatedLocationRequirement {
  const { location_requirement, normalized_location, stated_relocation_willingness, id } = input;
  const reqCity = location_requirement?.city || null;
  const isBlocking = Boolean(location_requirement?.blocking);

  const candCity = normalized_location.normalized?.city || null;
  const isDirectMatch = Boolean(
    reqCity && candCity && reqCity.toLowerCase() === candCity.toLowerCase()
  );

  let status: LocationStatus = "confirmed";
  let reasoning = "Location requirements satisfied.";

  if (!reqCity) {
    status = "confirmed";
    reasoning = candCity ? `Candidate based in ${candCity}.` : "Location is open/unspecified.";
  } else if (isDirectMatch) {
    status = "confirmed";
    reasoning = `Direct city match: ${candCity}.`;
  } else if (stated_relocation_willingness === "willing") {
    status = "confirmed";
    reasoning = `Based in ${candCity || "other location"}, but candidate stated willing to relocate to ${reqCity}.`;
  } else if (stated_relocation_willingness === "unwilling") {
    status = "contradicted";
    reasoning = `Candidate located in ${candCity || "different city"} and unwilling to relocate to ${reqCity}.`;
  } else {
    status = "ambiguous";
    reasoning = `Candidate located in ${candCity || "different city"}; relocation willingness to ${reqCity} is not stated.`;
  }

  const dotType =
    status === "confirmed"
      ? "confirmed"
      : status === "contradicted"
      ? "contradicted"
      : "gap";
  const pillText = normalized_location.raw || candCity || (reqCity ? `Location: ${reqCity}` : "Location");
  const badgeText =
    status === "confirmed"
      ? "Confirmed"
      : status === "contradicted"
      ? "Contradicted"
      : "Ambiguous";

  return {
    id: id || "req_location",
    category: "location",
    label: reqCity ? `Location: ${reqCity}` : "Location",
    blocking: isBlocking,
    status,
    evidence_span: normalized_location.raw,
    reasoning,
    derived: {
      dotType,
      pillText,
      badgeText,
    },
  };
}

