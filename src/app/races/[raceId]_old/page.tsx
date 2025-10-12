import Link from "next/link";
import { notFound } from "next/navigation";

import { RaceEntryTable } from "@/components/boat/RaceEntryTable";
import { RaceMetaPanel } from "@/components/boat/RaceMetaPanel";
import { getMockRaceById } from "@/data/mock/races";

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = getMockRaceById(raceId);

  if (!race) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12">
      <RaceMetaPanel race={race} />

      <div>
        <Link
          href={`/chat`}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d4fce]"
        >
          このレースでチャットを作成 →
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">出走表（モック）</h2>
        <RaceEntryTable entries={race.entries} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {race.notes.map((note) => (
          <div
            key={note}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5"
          >
            <p className="text-sm text-[var(--foreground)]">{note}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
