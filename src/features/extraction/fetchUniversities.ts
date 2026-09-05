import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { syncCatalog, slugify, type CatalogEntry } from "./entityCatalog";

export interface ExternalUniversity {
  name: string;
  domains: string[];
  alpha_two_code: string;
}

export interface UniversityEntry extends CatalogEntry {
  domains: string[];
  country: string;
}

export async function fetchUniversities(): Promise<UniversityEntry[]> {
  const aliasesPath = resolve(__dirname, "data/university_aliases.json");
  const aliasesMap: Record<string, string[]> = existsSync(aliasesPath)
    ? JSON.parse(readFileSync(aliasesPath, "utf-8"))
    : {};

  return syncCatalog<ExternalUniversity, UniversityEntry>({
    sourceUrl: "http://universities.hipolabs.com/search?country=Pakistan",
    cachePath: resolve(__dirname, "data/universities_pk-local.json"),
    targetPath: resolve(__dirname, "data/universities_pk.json"),
    aliasesMap,
    mapSource: (item) => ({
      id: slugify(item.name),
      canonicalName: item.name,
      domains: item.domains,
      country: item.alpha_two_code,
      aliases: [],
    }),
  });
}

if (process.argv[1]?.includes("fetchUniversities")) {
  fetchUniversities()
    .then((items) => console.log(`Wrote ${items.length} entries to data/universities_pk.json`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}