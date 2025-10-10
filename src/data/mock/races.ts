import type {
  BoatRaceDetail,
  BoatRaceEntry,
  BoatRaceSummary,
} from "@/types/race";

const baseEntries: BoatRaceEntry[] = [
  {
    lane: 1,
    racerName: "峰 竜太",
    branch: "佐賀",
    motorNo: 32,
    motorWinRate: 68.5,
    boatNo: 45,
    startTiming: "0.13",
    abilityScore: 9.5,
  },
  {
    lane: 2,
    racerName: "白井 英治",
    branch: "山口",
    motorNo: 57,
    motorWinRate: 64.2,
    boatNo: 12,
    startTiming: "0.16",
    abilityScore: 9.1,
  },
  {
    lane: 3,
    racerName: "毒島 誠",
    branch: "群馬",
    motorNo: 11,
    motorWinRate: 62.8,
    boatNo: 36,
    startTiming: "0.14",
    abilityScore: 8.8,
  },
  {
    lane: 4,
    racerName: "原田 幸哉",
    branch: "長崎",
    motorNo: 8,
    motorWinRate: 59.7,
    boatNo: 21,
    startTiming: "0.18",
    abilityScore: 8.5,
  },
  {
    lane: 5,
    racerName: "桐生 順平",
    branch: "埼玉",
    motorNo: 22,
    motorWinRate: 61.4,
    boatNo: 8,
    startTiming: "0.15",
    abilityScore: 8.9,
  },
  {
    lane: 6,
    racerName: "深谷 知博",
    branch: "静岡",
    motorNo: 5,
    motorWinRate: 57.1,
    boatNo: 64,
    startTiming: "0.17",
    abilityScore: 8.2,
  },
];

export const mockRaceSummaries: BoatRaceSummary[] = [
  {
    id: "naruto-20251010-g1",
    date: "2025-10-10",
    venue: "鳴門",
    day: 3,
    title: "鳴門 G1 開設71周年記念競走",
    grade: "G1",
    weather: "晴れ",
    windSpeed: 4,
    waveHeight: 5,
    aiRank: 4,
    status: "upcoming",
  },
  {
    id: "toda-20251010-g2",
    date: "2025-10-10",
    venue: "戸田",
    day: 2,
    title: "戸田 G2 モーターボート大賞",
    grade: "G2",
    weather: "くもり",
    windSpeed: 3,
    waveHeight: 4,
    aiRank: 3,
    status: "upcoming",
  },
  {
    id: "tamagawa-20251010-sg",
    date: "2025-10-10",
    venue: "多摩川",
    day: 1,
    title: "多摩川 SG ボートレースクラシック",
    grade: "SG",
    weather: "晴れ",
    windSpeed: 2,
    waveHeight: 3,
    aiRank: 5,
    status: "live",
  },
];

export const mockRaceDetails: BoatRaceDetail[] = mockRaceSummaries.map(
  (race) => ({
    ...race,
    description:
      "競艇版D-Logicのプレースホルダーです。実際のデータ連携時には、公式サイトから取得したレース情報を表示します。",
    entries: baseEntries,
    notes: [
      "スタート展示の進入状況を表示予定",
      "AI が算出した展開指数・信頼度を合わせて表示",
      "潮汐・水質など競艇特有の指標を追加",
    ],
  })
);

export function getMockRaces(): BoatRaceSummary[] {
  return mockRaceSummaries;
}

export function getMockRaceById(raceId: string): BoatRaceDetail | undefined {
  return mockRaceDetails.find((race) => race.id === raceId);
}
