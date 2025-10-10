import { RaceSummaryCard } from "./RaceSummaryCard";
import type { BoatRaceSummary } from "@/types/race";

interface RaceOverviewGridProps {
  races: BoatRaceSummary[];
}

export function RaceOverviewGrid({ races }: RaceOverviewGridProps) {
  if (!races.length) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
        表示できるレースがありません。
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {races.map((race) => (
        <RaceSummaryCard key={race.id} race={race} />
      ))}
    </div>
  );
}
