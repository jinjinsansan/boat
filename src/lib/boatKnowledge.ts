import fs from "fs/promises";
import path from "path";

const DEFAULT_CACHE_PATH = path.join("/tmp", "boat_knowledge_cache.jsonl");
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const DEFAULT_KNOWLEDGE_URL =
  process.env.BOAT_KNOWLEDGE_URL ??
  "https://pub-059afaafefa84116b57d57e0a72b81bd.r2.dev/boat_race_2020_2025.jsonl";

const DEFAULT_LOCAL_PATH = path.join(
  process.cwd(),
  "data",
  "processed",
  "boat_race_2020_2025.jsonl",
);

export interface BoatKnowledgeEntry {
  source: string;
  register_number: string;
  name_kanji: string;
  name_kana: string;
  branch: string;
  grade: string;
  profile_code: string;
  release_year?: number;
  release_month?: number;
  release_term?: string;
  metrics_primary: Array<number | null>;
  metrics_secondary: Array<number | null>;
  birthplace?: string;
}

type BoatKnowledgeRawEntry = BoatKnowledgeEntry & {
  metrics_primary_raw?: string[];
  metrics_secondary_raw?: string[];
  metrics_secondary_suffix?: string;
  raw_line?: string;
  text?: string;
};

export interface BoatKnowledgeIndex {
  entriesByRegister: Map<string, BoatKnowledgeEntry>;
  entriesByName: Map<string, BoatKnowledgeEntry>;
  metadata: {
    totalEntries: number;
    releases: Record<number, { term: string | null; count: number }>;
    source: string;
    generatedAt: string;
  };
}

let knowledgePromise: Promise<BoatKnowledgeIndex> | null = null;

function resolvePath(value: string): string {
  return path.isAbsolute(value) ? value : path.join(process.cwd(), value);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function isCacheValid(cachePath: string, ttlMs: number): Promise<boolean> {
  try {
    const stat = await fs.stat(cachePath);
    const age = Date.now() - stat.mtimeMs;
    return age < ttlMs;
  } catch {
    return false;
  }
}

function normaliseName(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/\s+/g, "")
    .replace(/[\u3000]/g, "")
    .trim()
    .toLowerCase();
}

async function readKnowledgeSource(): Promise<{ text: string; source: string }>
{
  if (process.env.BOAT_KNOWLEDGE_SOURCE?.trim()) {
    const customPath = process.env.BOAT_KNOWLEDGE_SOURCE.trim();
    const absolutePath = resolvePath(customPath);

    const text = await fs.readFile(absolutePath, "utf-8");
    return { text, source: absolutePath };
  }

  if (!DEFAULT_KNOWLEDGE_URL.startsWith("http://") && !DEFAULT_KNOWLEDGE_URL.startsWith("https://")) {
    const absolutePath = resolvePath(DEFAULT_KNOWLEDGE_URL);

    const text = await fs.readFile(absolutePath, "utf-8");
    return { text, source: absolutePath };
  }

  const cachePath = resolvePath(
    process.env.BOAT_KNOWLEDGE_CACHE_PATH?.trim() || DEFAULT_CACHE_PATH,
  );
  const cacheTtlMs = Number(process.env.BOAT_KNOWLEDGE_CACHE_TTL_MS ?? DEFAULT_CACHE_TTL_MS);

  if (await isCacheValid(cachePath, cacheTtlMs)) {
    const text = await fs.readFile(cachePath, "utf-8");
    return { text, source: cachePath };
  }

  try {
    const response = await fetch(DEFAULT_KNOWLEDGE_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(
        `Failed to download boat knowledge: ${response.status} ${response.statusText}`,
      );
    }

    const text = await response.text();
    try {
      await ensureDirectory(cachePath);
      await fs.writeFile(cachePath, text, "utf-8");
    } catch (error) {
      console.warn(`[boatKnowledge] Failed to persist cache at ${cachePath}: ${error}`);
    }

    return { text, source: cachePath };
  } catch (downloadError) {
    console.warn(`[boatKnowledge] CDN download failed: ${downloadError}`);
    if (await fileExists(cachePath)) {
      const text = await fs.readFile(cachePath, "utf-8");
      return { text, source: cachePath };
    }

    try {
      const text = await fs.readFile(DEFAULT_LOCAL_PATH, "utf-8");
      return { text, source: DEFAULT_LOCAL_PATH };
    } catch (localError) {
      throw new Error(
        `[boatKnowledge] Unable to load knowledge file. CDN error: ${downloadError}. Local fallback error: ${localError}`,
      );
    }
  }
}

function parseKnowledge(text: string, source: string): BoatKnowledgeIndex {
  const entriesByRegister = new Map<string, BoatKnowledgeEntry>();
  const entriesByName = new Map<string, BoatKnowledgeEntry>();
  const releases: Record<number, { term: string | null; count: number }> = {};

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const parsed = JSON.parse(trimmed) as BoatKnowledgeRawEntry;
      if (!parsed || !parsed.register_number) continue;

      const record: BoatKnowledgeEntry = {
        source: parsed.source,
        register_number: parsed.register_number,
        name_kanji: parsed.name_kanji,
        name_kana: parsed.name_kana,
        branch: parsed.branch,
        grade: parsed.grade,
        profile_code: parsed.profile_code,
        release_year: parsed.release_year,
        release_month: parsed.release_month,
        release_term: parsed.release_term,
        metrics_primary: parsed.metrics_primary ?? [],
        metrics_secondary: parsed.metrics_secondary ?? [],
        birthplace: parsed.birthplace,
      };

      entriesByRegister.set(record.register_number, record);

      const nameKey = normaliseName(record.name_kanji);
      if (nameKey) {
        entriesByName.set(nameKey, record);
      }

      if (record.release_year) {
        const key = record.release_year;
        if (!releases[key]) {
          releases[key] = { term: record.release_term ?? null, count: 0 };
        }
        releases[key].count += 1;
      }
    } catch (error) {
      console.warn(`[boatKnowledge] Failed to parse JSONL line: ${error}`);
    }
  }

  return {
    entriesByRegister,
    entriesByName,
    metadata: {
      totalEntries: entriesByRegister.size,
      releases,
      source,
      generatedAt: new Date().toISOString(),
    },
  };
}

async function loadKnowledge(): Promise<BoatKnowledgeIndex> {
  const { text, source } = await readKnowledgeSource();
  return parseKnowledge(text, source);
}

export async function getBoatKnowledge(): Promise<BoatKnowledgeIndex> {
  if (!knowledgePromise) {
    knowledgePromise = loadKnowledge();
  }
  return knowledgePromise;
}

export async function refreshBoatKnowledge(): Promise<BoatKnowledgeIndex> {
  knowledgePromise = loadKnowledge();
  return knowledgePromise;
}

export function findBoatEntry(
  index: BoatKnowledgeIndex,
  params: { registerNumber?: string; name?: string },
): BoatKnowledgeEntry | undefined {
  if (params.registerNumber) {
    const entry = index.entriesByRegister.get(params.registerNumber);
    if (entry) return entry;
  }

  if (params.name) {
    const entry = index.entriesByName.get(normaliseName(params.name));
    if (entry) return entry;
  }

  return undefined;
}
