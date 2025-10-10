import type { BoatRaceDetail } from "@/types/race";
import { formatDate } from "@/lib/formatters";

interface RaceMetaPanelProps {
  race: BoatRaceDetail;
}

export function RaceMetaPanel({ race }: RaceMetaPanelProps) {
  const tags = [
    `${race.weather} / 風 ${race.windSpeed}m`,
    `波高 ${race.waveHeight}cm`,
    `AI注目度 ${race.aiRank}/5`,
  ];

  return (
    <div className="space-y-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          {formatDate(race.date)} / Day {race.day}
        </p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          {race.venue} {race.title}
        </h1>
        <p className="text-sm text-[var(--muted)]">{race.description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#f0f4ff] px-4 py-1 text-xs font-semibold text-[#0f62fe]"
          >
            {tag}
          </span>
        ))}
      </div>

      <ul className="space-y-2 text-sm text-[var(--muted)]">
        {race.notes.map((note) => (
          <li key={note} className="flex gap-2">
            <span aria-hidden>•</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
