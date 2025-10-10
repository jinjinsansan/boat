export type RaceGrade = "SG" | "G1" | "G2" | "G3" | "一般";

export interface BoatRaceEntry {
  lane: number;
  racerName: string;
  branch: string;
  motorNo: number;
  motorWinRate: number;
  boatNo: number;
  startTiming: string;
  abilityScore: number;
}

export interface BoatRaceSummary {
  id: string;
  date: string;
  venue: string;
  day: number;
  title: string;
  grade: RaceGrade;
  weather: string;
  windSpeed: number;
  waveHeight: number;
  aiRank: number;
  status: "upcoming" | "live" | "finished";
}

export interface BoatRaceDetail extends BoatRaceSummary {
  description: string;
  entries: BoatRaceEntry[];
  notes: string[];
}

export interface ChatSessionSummary {
  id: string;
  raceId: string;
  title: string;
  updatedAt: string;
  highlight: string;
}

export interface ChatMessageMock {
  id: string;
  author: "user" | "ai";
  content: string;
  createdAt: string;
}
