import "server-only";

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
  sargodha: "Punjab",
  sahiwal: "Punjab",
  attock: "Punjab",
  phalia: "Punjab",
  "mandi bahauddin": "Punjab",
  "wah cantt": "Punjab",
  wah: "Punjab",
  mianwali: "Punjab",
  bahawalpur: "Punjab",
  gujrat: "Punjab",
  jhelum: "Punjab",
  sheikhupura: "Punjab",
  kasur: "Punjab",
  okara: "Punjab",
  chakwal: "Punjab",
  khushab: "Punjab",
  "rahim yar khan": "Punjab",
  "dera ghazi khan": "Punjab",
  mirpurkhas: "Sindh",
  umerkot: "Sindh",
  chachro: "Sindh",
  tharparkar: "Sindh",
  hyderabad: "Sindh",
  sukkur: "Sindh",
  larkana: "Sindh",
  nawabshah: "Sindh",
  chitral: "Khyber Pakhtunkhwa",
  abbottabad: "Khyber Pakhtunkhwa",
  mardan: "Khyber Pakhtunkhwa",
  swat: "Khyber Pakhtunkhwa",
  mingora: "Khyber Pakhtunkhwa",
  kohat: "Khyber Pakhtunkhwa",
  haripur: "Khyber Pakhtunkhwa",
  nowshera: "Khyber Pakhtunkhwa",
  "dera ismail khan": "Khyber Pakhtunkhwa",
  mansehra: "Khyber Pakhtunkhwa",
  topi: "Khyber Pakhtunkhwa",
  swabi: "Khyber Pakhtunkhwa",
  muzaffarabad: "Azad Jammu and Kashmir",
  mirpur: "Azad Jammu and Kashmir",
  gilgit: "Gilgit-Baltistan",
  skardu: "Gilgit-Baltistan",
};

export interface NormalizedLocationResult {
  city: string | null;
  province: string | null;
}

// Formats a matched city key or alias into canonical display casing
function formatCanonicalCity(cityRaw: string): string {
  const lower = cityRaw.trim().toLowerCase();
  if (lower === "isb" || lower === "islamabad" || lower === "ict") return "Islamabad";
  if (lower === "lhr" || lower === "lahore") return "Lahore";
  if (lower === "khi" || lower === "karachi") return "Karachi";
  if (lower === "pindi" || lower === "rawalpindi") return "Rawalpindi";
  if (lower === "wah" || lower === "wah cantt") return "Wah Cantt";
  return lower
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Maps a detected city name to its canonical province or federal territory
export function getProvinceForCity(city: string | null | undefined): string | null {
  if (!city) return null;
  const lower = city.trim().toLowerCase().replace(/\.$/, "");
  if (lower === "isb" || lower === "islamabad" || lower === "ict") return CITY_PROVINCE_MAP.islamabad;
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
  const rawCityInput = (extractedCity || "").trim().replace(/\.$/, "");
  const cityInput = /^(pakistan|remote|fully remote|anywhere in pakistan|open to travel|unspecified)$/i.test(
    rawCityInput
  )
    ? ""
    : rawCityInput;
  const rawInput = (rawText || "").trim();

  // Country-only or remote indicators without municipality are treated as unspecified
  const lowerRaw = rawInput.toLowerCase();
  if (
    (!cityInput && /^(pakistan|remote|fully remote|anywhere in pakistan|open to travel)$/i.test(lowerRaw)) ||
    (!cityInput && !rawInput)
  ) {
    return { city: null, province: null };
  }

  // 1. If explicit city was provided, check it first
  if (cityInput) {
    const prov = getProvinceForCity(cityInput);
    if (prov) {
      return { city: formatCanonicalCity(cityInput), province: prov };
    }
  }

  // 2. Check trailing municipality before ", Pakistan" in structured addresses
  const trailingCityMatch = rawInput.match(/,\s*([^,]+?)\s*,\s*pakistan\s*$/i);
  if (trailingCityMatch) {
    const trailingToken = trailingCityMatch[1].trim().replace(/\.$/, "");
    const trailingProv = getProvinceForCity(trailingToken);
    if (trailingProv) {
      return { city: formatCanonicalCity(trailingToken), province: trailingProv };
    }
  }

  const combined = `${cityInput} ${rawInput}`.toLowerCase();

  // 3. Check for major city names and aliases before sector regexes
  if (/\b(islamabad|isb|ict)\b/i.test(combined)) {
    return { city: "Islamabad", province: CITY_PROVINCE_MAP.islamabad };
  }

  if (/\b(lahore|lhr|gulberg|model town|harbanspura)\b/i.test(combined)) {
    return { city: "Lahore", province: CITY_PROVINCE_MAP.lahore };
  }

  if (/\b(karachi|khi|clifton|korangi)\b/i.test(combined)) {
    return { city: "Karachi", province: CITY_PROVINCE_MAP.karachi };
  }

  if (/\b(rawalpindi|pindi)\b/i.test(combined)) {
    return { city: "Rawalpindi", province: CITY_PROVINCE_MAP.rawalpindi };
  }

  // 4. Check generic dictionary keys (longest keys first so multi-word cities match first)
  const sortedKeys = Object.keys(CITY_PROVINCE_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (new RegExp(`\\b${key}\\b`, "i").test(combined)) {
      return { city: formatCanonicalCity(key), province: CITY_PROVINCE_MAP[key] };
    }
  }

  // 5. Fallback to Islamabad sector pattern (e.g. G-13, F-10, H-12) when no other city matched
  if (/\b[efghi]-\d{1,2}\b/i.test(combined)) {
    return { city: "Islamabad", province: CITY_PROVINCE_MAP.islamabad };
  }

  return { city: null, province: null };
}
