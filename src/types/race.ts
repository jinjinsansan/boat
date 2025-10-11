export type RaceGrade = "SG" | "G1" | "G2" | "G3" | "一般";

export interface BoatRaceEntry {
  lane: number;
  racerName: string;
  registerNumber: string;
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
