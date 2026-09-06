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
  const reqProvince = location_requirement?.province || null;
  const isBlocking = Boolean(location_requirement?.blocking);

  const candCity = normalized_location.normalized?.city || null;
  const candProvince = normalized_location.normalized?.province || null;

  const targetLocation = [reqCity, reqProvince].filter(Boolean).join(", ");
  const isCityMatch = Boolean(reqCity && candCity && reqCity.toLowerCase() === candCity.toLowerCase());
  const isProvinceMatch = Boolean(reqProvince && candProvince && reqProvince.toLowerCase() === candProvince.toLowerCase());

  let status: LocationStatus = "confirmed";
  let reasoning = "Location requirements satisfied.";

  if (!reqCity && !reqProvince) {
    status = "confirmed";
    reasoning = candCity ? `Candidate based in ${[candCity, candProvince].filter(Boolean).join(", ")}.` : "Location is open/unspecified.";
  } else if (reqCity && isCityMatch) {
    status = "confirmed";
    reasoning = `Direct city match: ${candCity}.`;
  } else if (!reqCity && reqProvince && isProvinceMatch) {
    status = "confirmed";
    reasoning = `Province match: ${candProvince} (${candCity || "unspecified city"}).`;
  } else if (stated_relocation_willingness === "willing") {
    status = "confirmed";
    reasoning = `Based in ${candCity || candProvince || "other location"}, but candidate stated willing to relocate to ${targetLocation}.`;
  } else if (stated_relocation_willingness === "unwilling") {
    status = "contradicted";
    reasoning = `Candidate located in ${candCity || candProvince || "different location"} and unwilling to relocate to ${targetLocation}.`;
  } else {
    status = "ambiguous";
    reasoning = `Candidate located in ${candCity || candProvince || "different location"}; relocation willingness to ${targetLocation} is not stated.`;
  }

  const dotType =
    status === "confirmed"
      ? "confirmed"
      : status === "contradicted"
      ? "contradicted"
      : "gap";
  const pillText = normalized_location.raw || candCity || (targetLocation ? `Location: ${targetLocation}` : "Location");
  const badgeText =
    status === "confirmed"
      ? "Confirmed"
      : status === "contradicted"
      ? "Contradicted"
      : "Ambiguous";

  return {
    id: id || "req_location",
    category: "location",
    label: targetLocation ? `Location: ${targetLocation}` : "Location",
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

