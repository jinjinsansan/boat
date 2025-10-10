import { RaceOverviewGrid } from "@/components/boat/RaceOverviewGrid";
import { formatDate } from "@/lib/formatters";
import { getMockRaces } from "@/data/mock/races";

export default function RacesPage() {
  const races = getMockRaces();
  const grouped = races.reduce<Record<string, typeof races>>((acc, race) => {
    if (!acc[race.date]) {
      acc[race.date] = [];
    }
    acc[race.date].push(race);
    return acc;
  }, {});

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-[var(--brand-secondary)]">
          RACE SCHEDULE
        </p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">レース一覧（モック）</h1>
        <p className="text-sm text-[var(--muted)]">
          競艇公式サイトの LZH データを取り込むまでの暫定表示です。競馬版のコンポーネントを元に競艇仕様へ調整しています。
        </p>
      </header>

      <div className="space-y-10">
        {Object.entries(grouped).map(([date, dayRaces]) => (
          <section key={date} className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {formatDate(date)} 開催
              </h2>
              <p className="text-sm text-[var(--muted)]">
                {dayRaces.length} 件のモックレースを表示しています。
              </p>
            </div>
            <RaceOverviewGrid races={dayRaces} />
          </section>
        ))}
      </div>
    </div>
  );
}
