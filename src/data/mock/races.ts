import type {
  BoatRaceDetail,
  BoatRaceEntry,
  BoatRaceSummary,
} from "@/types/race";

const baseEntryTemplates: Omit<BoatRaceEntry, "registerNumber">[] = [
  {
    lane: 1,
    racerName: "峰 竜太",
    branch: "佐賀",
    motorNo: 32,
    motorWinRate: 68.5,
    boatNo: 45,
    boatWinRate: 71.2,
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
    boatWinRate: 66.1,
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
    boatWinRate: 64.8,
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
    boatWinRate: 61.3,
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
    boatWinRate: 62.0,
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
    boatWinRate: 58.4,
    startTiming: "0.17",
    abilityScore: 8.2,
  },
];

function createRaceEntries(seed: number): BoatRaceEntry[] {
  return baseEntryTemplates.map((entry, index) => ({
    ...entry,
    registerNumber: String(seed + index).padStart(4, "0"),
  }));
}

// レース名のテンプレート（グレード別）
const raceNameTemplates = {
  SG: ["ボートレースクラシック", "グランプリ", "オーシャンカップ"],
  G1: ["開設記念競走", "周年記念", "ダービー"],
  G2: ["モーターボート大賞", "秩父宮妃記念杯", "レディースチャンピオン"],
  G3: ["オールスター競走", "マスターズリーグ", "若鷹リーグ"],
  一般: ["一般競走", "予選", "準優勝戦", "優勝戦"],
};

// 開催場リスト（将来の拡張用）
// const _venues = ["鳴門", "戸田", "多摩川", "浜名湖", "児島", "宮島"];

// レース詳細データを生成する関数
function generateRaceDetail(
  date: string,
  venue: string,
  raceNumber: number,
  grade: "SG" | "G1" | "G2" | "G3" | "一般"
): BoatRaceSummary {
  const templates = raceNameTemplates[grade];
  const raceName = templates[Math.floor(Math.random() * templates.length)];
  const raceId = `${venue}-${date}-${raceNumber}r`;

  return {
    id: raceId,
    date,
    venue,
    day: raceNumber,
    title: `${venue} ${grade === "一般" ? "" : grade + " "}${raceName}`,
    grade,
    weather: ["晴れ", "くもり", "雨"][Math.floor(Math.random() * 3)],
    windSpeed: Math.floor(Math.random() * 6) + 1,
    waveHeight: Math.floor(Math.random() * 8) + 2,
    aiRank: Math.floor(Math.random() * 5) + 1,
    status: "upcoming",
  };
}

// モックデータ生成
export const mockRaceSummaries: BoatRaceSummary[] = [];

// 10月12日（日） - 鳴門（G1）、戸田（G2）
const date1012 = "2025-10-12";
for (let r = 1; r <= 10; r++) {
  const grade = r === 10 ? "G1" : r >= 8 ? "G3" : "一般";
  mockRaceSummaries.push(generateRaceDetail(date1012, "鳴門", r, grade));
}
for (let r = 1; r <= 10; r++) {
  const grade = r === 10 ? "G2" : r >= 8 ? "G3" : "一般";
  mockRaceSummaries.push(generateRaceDetail(date1012, "戸田", r, grade));
}

// 10月11日（土） - 多摩川（SG）、浜名湖（G3）
const date1011 = "2025-10-11";
for (let r = 1; r <= 10; r++) {
  const grade = r === 10 ? "SG" : r >= 8 ? "G1" : "一般";
  mockRaceSummaries.push(generateRaceDetail(date1011, "多摩川", r, grade));
}
for (let r = 1; r <= 10; r++) {
  const grade = r === 10 ? "G3" : "一般";
  mockRaceSummaries.push(generateRaceDetail(date1011, "浜名湖", r, grade));
}

// 10月5日（日） - 児島（G2）、宮島（一般）
const date1005 = "2025-10-05";
for (let r = 1; r <= 10; r++) {
  const grade = r === 10 ? "G2" : r >= 8 ? "G3" : "一般";
  mockRaceSummaries.push(generateRaceDetail(date1005, "児島", r, grade));
}
for (let r = 1; r <= 10; r++) {
  mockRaceSummaries.push(generateRaceDetail(date1005, "宮島", r, "一般"));
}

// 10月4日（土） - 鳴門（一般）、戸田（一般）
const date1004 = "2025-10-04";
for (let r = 1; r <= 10; r++) {
  mockRaceSummaries.push(generateRaceDetail(date1004, "鳴門", r, "一般"));
}
for (let r = 1; r <= 10; r++) {
  mockRaceSummaries.push(generateRaceDetail(date1004, "戸田", r, "一般"));
}

export const mockRaceDetails: BoatRaceDetail[] = mockRaceSummaries.map(
  (race, index) => ({
    ...race,
    description:
      "競艇版D-Logicのプレースホルダーです。実際のデータ連携時には、公式サイトから取得したレース情報を表示します。",
    entries: createRaceEntries(3300 + index * 10),
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

export function getParticipantsByRaceId(raceId: string): BoatRaceEntry[] {
  const race = getMockRaceById(raceId);
  return race ? race.entries : [];
}

// 日付でグループ化したレースデータを取得
export interface GroupedRacesByDate {
  date: string;
  displayDate: string;
  venues: string[];
  totalRaces: number;
}

export function getGroupedRacesByDate(): GroupedRacesByDate[] {
  const dateMap = new Map<string, Set<string>>();

  mockRaceSummaries.forEach((race) => {
    if (!dateMap.has(race.date)) {
      dateMap.set(race.date, new Set());
    }
    dateMap.get(race.date)!.add(race.venue);
  });

  return Array.from(dateMap.entries())
    .map(([date, venues]) => {
      const racesForDate = mockRaceSummaries.filter((r) => r.date === date);
      const dateObj = new Date(date);
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
      const weekday = weekdays[dateObj.getDay()];

      return {
        date,
        displayDate: `${month}月${day}日(${weekday})`,
        venues: Array.from(venues),
        totalRaces: racesForDate.length,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // 新しい日付順
}

// 特定の日付と開催場のレース一覧を取得
export function getRacesByDateAndVenue(date: string, venue: string): BoatRaceSummary[] {
  return mockRaceSummaries
    .filter((race) => race.date === date && race.venue === venue)
    .sort((a, b) => a.day - b.day); // レース番号順
}
