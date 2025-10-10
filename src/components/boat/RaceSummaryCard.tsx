import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import type { BoatRaceSummary } from "@/types/race";

const gradeColors: Record<BoatRaceSummary["grade"], string> = {
  SG: "bg-[#0f62fe]/10 text-[#0f62fe]",
  G1: "bg-[#3dd6d0]/15 text-[#0f776d]",
  G2: "bg-[#ffb347]/15 text-[#a7651a]",
  G3: "bg-[#fde68a]/20 text-[#b45309]",
  一般: "bg-[var(--border)] text-[var(--muted)]",
};

interface RaceSummaryCardProps {
  race: BoatRaceSummary;
}

export function RaceSummaryCard({ race }: RaceSummaryCardProps) {
  return (
    <Link
      href={`/races/${race.id}`}
      className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            {formatDate(race.date)} / Day {race.day}
          </p>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {race.venue} {race.title}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${gradeColors[race.grade]}`}
        >
          {race.grade}
        </span>
      </div>

      <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
        <p>
          天候: {race.weather} / 風 {race.windSpeed}m / 波高 {race.waveHeight}cm
        </p>
        <p>AI 注目度: {"★".repeat(race.aiRank)}{"☆".repeat(Math.max(0, 5 - race.aiRank))}</p>
      </div>

      <div className="flex items-center justify-between text-sm font-semibold text-[var(--brand-primary)]">
        <span>
          {race.status === "live"
            ? "LIVE配信中"
            : race.status === "finished"
              ? "結果閲覧"
              : "詳細を見る"}
        </span>
        <span aria-hidden>→</span>
      </div>
    </Link>
  );
}
