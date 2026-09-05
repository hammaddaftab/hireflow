import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Lean base contract for any canonical reference item
export interface CatalogEntry {
  id: string;
  canonicalName: string;
  aliases: string[];
  [key: string]: unknown;
}

// Options to sync an external source into a local reference JSON catalog
export interface CatalogSyncOptions<TSource, TEntry extends CatalogEntry> {
  sourceUrl?: string;
  cachePath?: string;
  targetPath: string;
  aliasesMap?: Record<string, string[]>;
  mapSource: (source: TSource) => TEntry;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Reads from local cache or fetches from sourceUrl, maps entries, and saves
export async function syncCatalog<TSource, TEntry extends CatalogEntry>({
  sourceUrl,
  cachePath,
  targetPath,
  aliasesMap,
  mapSource,
}: CatalogSyncOptions<TSource, TEntry>): Promise<TEntry[]> {
  await mkdir(dirname(targetPath), { recursive: true });

  let sourceItems: TSource[];

  if (cachePath && existsSync(cachePath)) {
    sourceItems = JSON.parse(await readFile(cachePath, "utf-8"));
  } else if (sourceUrl) {
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    sourceItems = (await res.json()) as TSource[];
    if (cachePath) {
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, JSON.stringify(sourceItems, null, 2), "utf-8");
    }
  } else {
    throw new Error("Must provide sourceUrl or existing cachePath");
  }

  // Preserve existing aliases across re-fetches
  const existingById = new Map<string, TEntry>();
  if (existsSync(targetPath)) {
    try {
      const prev = JSON.parse(await readFile(targetPath, "utf-8")) as TEntry[];
      for (const item of prev) existingById.set(item.id, item);
    } catch {
      // Ignore if parse fails
    }
  }

  const entries = sourceItems.map((source) => {
    const entry = mapSource(source);
    const existing = existingById.get(entry.id);
    const seededAliases = aliasesMap?.[entry.id] || [];
    const existingAliases = existing?.aliases || [];
    const combined = Array.from(
      new Set([...existingAliases, ...seededAliases, ...(entry.aliases || [])])
    );
    entry.aliases = combined;
    return entry;
  });

  await writeFile(targetPath, JSON.stringify(entries, null, 2), "utf-8");
  return entries;
}
