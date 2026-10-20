// Canonical city to province / territory mapping
export const CITY_PROVINCE_MAP: Record<string, string> = {
  islamabad: "Islamabad Capital Territory",
  lahore: "Punjab",
  rawalpindi: "Punjab",
  karachi: "Sindh",
  faisalabad: "Punjab",
  multan: "Punjab",
  peshawar: "Khyber Pakhtunkhwa",
  quetta: "Balochistan",
  sialkot: "Punjab",
  gujranwala: "Punjab",
};

export interface NormalizedLocationResult {
  city: string | null;
  province: string | null;
}

// Maps a detected city name to its canonical province or federal territory
export function getProvinceForCity(city: string | null | undefined): string | null {
  if (!city) return null;
  const lower = city.trim().toLowerCase();
  if (lower === "isb" || lower === "islamabad") return CITY_PROVINCE_MAP.islamabad;
  if (lower === "lhr" || lower === "lahore") return CITY_PROVINCE_MAP.lahore;
  if (lower === "khi" || lower === "karachi") return CITY_PROVINCE_MAP.karachi;
  if (lower === "pindi" || lower === "rawalpindi") return CITY_PROVINCE_MAP.rawalpindi;
  return CITY_PROVINCE_MAP[lower] || null;
}

// Resolves canonical city and province from raw location text or pre-extracted city
export function normalizeLocation(
  rawText: string | null | undefined,
  extractedCity?: string | null
): NormalizedLocationResult {
  const cityInput = (extractedCity || "").trim();
  const rawInput = (rawText || "").trim();

  // Country-only or remote indicators without municipality are treated as unspecified
  const lowerRaw = rawInput.toLowerCase();
  if (
    /^(pakistan|remote|fully remote|anywhere in pakistan|open to travel)$/i.test(lowerRaw) ||
    (!cityInput && !rawInput)
  ) {
    return { city: null, province: null };
  }

  // 1. If explicit city was provided, check it first
  if (cityInput) {
    const prov = getProvinceForCity(cityInput);
    if (prov) {
      const lowerCity = cityInput.toLowerCase();
      const canonicalCity =
        lowerCity === "isb"
          ? "Islamabad"
          : lowerCity === "lhr"
          ? "Lahore"
          : lowerCity === "khi"
          ? "Karachi"
          : lowerCity === "pindi"
          ? "Rawalpindi"
          : cityInput.charAt(0).toUpperCase() + cityInput.slice(1);
      return { city: canonicalCity, province: prov };
    }
  }

  const combined = `${cityInput} ${rawInput}`.toLowerCase();

  // 2. Check for Islamabad variations, sectors (e.g. G-13, F-10), and abbreviations
  if (/\b(islamabad|isb|ict)\b/i.test(combined) || /\b[efghi]-\d{1,2}\b/i.test(combined)) {
    return { city: "Islamabad", province: CITY_PROVINCE_MAP.islamabad };
  }

  // 3. Check for Lahore aliases
  if (/\b(lahore|lhr|gulberg|model town)\b/i.test(combined)) {
    return { city: "Lahore", province: CITY_PROVINCE_MAP.lahore };
  }

  // 4. Check for Karachi aliases
  if (/\b(karachi|khi|clifton|korangi)\b/i.test(combined)) {
    return { city: "Karachi", province: CITY_PROVINCE_MAP.karachi };
  }

  // 5. Check for Rawalpindi aliases
  if (/\b(rawalpindi|pindi)\b/i.test(combined)) {
    return { city: "Rawalpindi", province: CITY_PROVINCE_MAP.rawalpindi };
  }

  // 6. Check generic dictionary keys
  for (const [key, prov] of Object.entries(CITY_PROVINCE_MAP)) {
    if (new RegExp(`\\b${key}\\b`, "i").test(combined)) {
      const canonicalCity = key.charAt(0).toUpperCase() + key.slice(1);
      return { city: canonicalCity, province: prov };
    }
  }

  return { city: null, province: null };
}
