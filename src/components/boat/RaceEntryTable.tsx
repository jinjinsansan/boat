import type { BoatRaceEntry } from "@/types/race";

interface RaceEntryTableProps {
  entries: BoatRaceEntry[];
}

export function RaceEntryTable({ entries }: RaceEntryTableProps) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
      <table className="w-full min-w-[640px] table-fixed text-sm">
        <thead className="bg-[#f0f4ff] text-left text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-semibold">艇</th>
            <th className="px-4 py-3 font-semibold">選手</th>
            <th className="px-4 py-3 font-semibold">支部</th>
            <th className="px-4 py-3 font-semibold">モーター</th>
            <th className="px-4 py-3 font-semibold">勝率</th>
            <th className="px-4 py-3 font-semibold">ボート</th>
            <th className="px-4 py-3 font-semibold">ST</th>
            <th className="px-4 py-3 font-semibold">AI指数</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.lane}
              className="border-t border-[var(--border)] text-[var(--foreground)]"
            >
              <td className="px-4 py-3 font-semibold">{entry.lane}</td>
              <td className="px-4 py-3 font-medium">{entry.racerName}</td>
              <td className="px-4 py-3">{entry.branch}</td>
              <td className="px-4 py-3">#{entry.motorNo}</td>
              <td className="px-4 py-3">{entry.motorWinRate.toFixed(1)}%</td>
              <td className="px-4 py-3">#{entry.boatNo}</td>
              <td className="px-4 py-3">{entry.startTiming}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-[#0f62fe]/10 px-3 py-1 text-xs font-semibold text-[#0f62fe]">
                  {entry.abilityScore.toFixed(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
