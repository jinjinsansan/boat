import { findBoatEntry, getBoatKnowledge, BoatKnowledgeEntry } from "./boatKnowledge";

export interface BoatRaceContext {
  raceId: string;
  raceDate?: string;
  venue?: string;
  grade?: string;
  weather?: string;
  waterCondition?: string;
}

export interface BoatParticipantInput {
  name?: string;
  registerNumber?: string;
  lane?: number;
  branch?: string;
}

export interface BoatEngineScore {
  name: string;
  registerNumber?: string;
  lane?: number;
  branch?: string;
  score: number;
  rank: number;
  confidence: "high" | "medium" | "low" | "none";
  dataAvailable: boolean;
  components: {
    baseScore: number;
    primaryScore: number;
    secondaryScore: number;
    experienceBonus: number;
    recencyMultiplier: number;
    gradeFactor: number;
    venueBonus: number;
  };
  releaseInfo?: {
    year?: number;
    month?: number;
    term?: string;
  };
  knowledgeSource?: string;
  missingReason?: string;
}

const PRIMARY_WEIGHTS = Array.from({ length: 25 }, (_, index) => 3 - index * 0.08);
const SECONDARY_WEIGHTS = Array.from({ length: 20 }, (_, index) => 1.2 - index * 0.04);

const GRADE_FACTORS: Record<string, number> = {
  SG: 1.25,
  G1: 1.18,
  G2: 1.12,
  G3: 1.06,
  一般: 1.0,
};

function weightedAverage(values: Array<number | null>, weights: number[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  values.forEach((value, idx) => {
    if (value === null || Number.isNaN(value)) return;
    const weight = weights[idx] ?? weights[weights.length - 1];
    if (weight <= 0) return;
    totalWeight += weight;
    weightedSum += value * weight;
  });

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}

function calculateExperienceBonus(entry: BoatKnowledgeEntry): number {
  const primaryAvailable = entry.metrics_primary.filter((value) => value !== null).length;
  const secondaryAvailable = entry.metrics_secondary.filter((value) => value !== null).length;
  const totalAvailable = primaryAvailable + secondaryAvailable;

  if (totalAvailable >= 40) return 6;
  if (totalAvailable >= 30) return 4;
  if (totalAvailable >= 20) return 2;
  if (totalAvailable >= 10) return 1;
  return 0;
}

function determineConfidence(entry: BoatKnowledgeEntry | undefined): "high" | "medium" | "low" | "none" {
  if (!entry) return "none";
  const primaryAvailable = entry.metrics_primary.filter((value) => value !== null).length;

  if (primaryAvailable >= 18) return "high";
  if (primaryAvailable >= 12) return "medium";
  if (primaryAvailable > 0) return "low";
  return "none";
}

function computeRecencyMultiplier(entry: BoatKnowledgeEntry, context: BoatRaceContext): number {
  if (!entry.release_year) return 1;

  const raceYear = context.raceDate ? new Date(context.raceDate).getFullYear() : new Date().getFullYear();
  const delta = Math.max(0, raceYear - entry.release_year);

  // 1年ごとに3%ずつ低下（下限0.82）
  const multiplier = 1 - delta * 0.03;
  return Math.max(0.82, multiplier);
}

function computeGradeFactor(targetGrade: string | undefined, entryGrade: string | undefined): number {
  const target = targetGrade ? GRADE_FACTORS[targetGrade] ?? 1 : 1;
  const entry = entryGrade ? GRADE_FACTORS[entryGrade] ?? 1 : 1;
  // 参加対象のグレード比からフィット感を評価
  const ratio = entry === 0 ? 1 : target / entry;
  // 50%から150%の範囲に制限
  return Math.max(0.85, Math.min(1.35, ratio));
}

const VENUE_BRANCH_MAP: Record<string, string> = {
  "桐生": "群馬",
  "戸田": "埼玉",
  "江戸川": "東京",
  "平和島": "東京",
  "多摩川": "東京",
  "浜名湖": "静岡",
  "蒲郡": "愛知",
  "常滑": "愛知",
  "津": "三重",
  "三国": "福井",
  "びわこ": "滋賀",
  "住之江": "大阪",
  "尼崎": "兵庫",
  "鳴門": "徳島",
  "丸亀": "香川",
  "児島": "岡山",
  "宮島": "広島",
  "徳山": "山口",
  "下関": "山口",
  "若松": "福岡",
  "芦屋": "福岡",
  "福岡": "福岡",
  "唐津": "佐賀",
  "大村": "長崎",
};

function computeVenueBonus(entry: BoatKnowledgeEntry, context: BoatRaceContext, participant: BoatParticipantInput): number {
  if (!context.venue) return 0;
  const expectedBranch = VENUE_BRANCH_MAP[context.venue];
  if (!expectedBranch) return 0;

  const branch = participant.branch ?? entry.branch;
  if (branch && branch === expectedBranch) {
    return 2.5;
  }
  return 0;
}

function calculateScore(
  entry: BoatKnowledgeEntry,
  context: BoatRaceContext,
  participant: BoatParticipantInput,
  knowledgeSource: string,
): BoatEngineScore {
  const primaryScore = weightedAverage(entry.metrics_primary, PRIMARY_WEIGHTS);
  const secondaryScore = weightedAverage(entry.metrics_secondary, SECONDARY_WEIGHTS);
  const experienceBonus = calculateExperienceBonus(entry);
  const recencyMultiplier = computeRecencyMultiplier(entry, context);
  const gradeFactor = computeGradeFactor(context.grade, entry.grade);
  const venueBonus = computeVenueBonus(entry, context, participant);

  const baseScore = primaryScore * 0.72 + secondaryScore * 0.18 + experienceBonus;
  const adjustedScore = (baseScore + venueBonus) * recencyMultiplier * gradeFactor;
  const finalScore = Math.max(0, Math.min(120, Math.round(adjustedScore * 10) / 10));

  const confidence = determineConfidence(entry);

  return {
    name: entry.name_kanji,
    registerNumber: entry.register_number,
    lane: participant.lane,
    branch: participant.branch ?? entry.branch,
    score: finalScore,
    rank: 0,
    confidence,
    dataAvailable: true,
    components: {
      baseScore: Math.round(baseScore * 10) / 10,
      primaryScore: Math.round(primaryScore * 10) / 10,
      secondaryScore: Math.round(secondaryScore * 10) / 10,
      experienceBonus,
      recencyMultiplier: Math.round(recencyMultiplier * 100) / 100,
      gradeFactor: Math.round(gradeFactor * 100) / 100,
      venueBonus: Math.round(venueBonus * 10) / 10,
    },
    releaseInfo: {
      year: entry.release_year,
      month: entry.release_month,
      term: entry.release_term,
    },
    knowledgeSource,
  };
}

function createMissingScore(participant: BoatParticipantInput): BoatEngineScore {
  return {
    name: participant.name ?? "不明",
    registerNumber: participant.registerNumber,
    lane: participant.lane,
    branch: participant.branch,
    score: 0,
    rank: 0,
    confidence: "none",
    dataAvailable: false,
    components: {
      baseScore: 0,
      primaryScore: 0,
      secondaryScore: 0,
      experienceBonus: 0,
      recencyMultiplier: 1,
      gradeFactor: 1,
      venueBonus: 0,
    },
    missingReason: "ナレッジに該当レーサーが存在しません",
  };
}

export interface BoatEngineRequest {
  context: BoatRaceContext;
  participants: BoatParticipantInput[];
}

export interface BoatEngineResponse {
  raceId: string;
  generatedAt: string;
  knowledgeSource: string;
  participants: BoatEngineScore[];
  metadata: {
    knowledgeSize: number;
    releases: Record<string, { term: string | null; count: number }>;
  };
}

export async function runBoatEngine(
  request: BoatEngineRequest,
): Promise<BoatEngineResponse> {
  const { context, participants } = request;
  if (!context?.raceId) {
    throw new Error("raceId is required in context");
  }
  if (!participants || participants.length === 0) {
    throw new Error("participants must contain at least one entry");
  }

  const knowledge = await getBoatKnowledge();

  const scored = participants.map((participant) => {
    const entry = findBoatEntry(knowledge, {
      registerNumber: participant.registerNumber,
      name: participant.name,
    });

    if (!entry) {
      return createMissingScore(participant);
    }

    return calculateScore(entry, context, participant, knowledge.metadata.source);
  });

  const present = scored.filter((item) => item.dataAvailable);
  present.sort((a, b) => b.score - a.score);

  present.forEach((item, index) => {
    item.rank = index + 1;
  });

  const missing = scored.filter((item) => !item.dataAvailable);

  const combined = [...present, ...missing];

  return {
    raceId: context.raceId,
    generatedAt: new Date().toISOString(),
    knowledgeSource: knowledge.metadata.source,
    participants: combined,
    metadata: {
      knowledgeSize: knowledge.metadata.totalEntries,
      releases: knowledge.metadata.releases,
    },
  };
}
