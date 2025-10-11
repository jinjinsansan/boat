'use client';

import { Gauge, Info, MapPin, Wind } from 'lucide-react';

import type { BoatRaceDetail } from '@/types/race';
import { RaceEntryTable } from '@/components/boat/RaceEntryTable';

interface RaceInfoPanelProps {
  race: BoatRaceDetail;
}

export function RaceInfoPanel({ race }: RaceInfoPanelProps) {
  return (
    <aside className="flex h-full flex-col gap-4">
      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0f62fe]/10 px-3 py-1 text-[var(--brand-primary)]">
              {race.grade}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {race.venue}
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind size={14} />
              風 {race.windSpeed}m/s / 波 {race.waveHeight}cm
            </span>
            <span className="inline-flex items-center gap-1">
              <Gauge size={14} />
              AI指数 {race.aiRank}/5
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{race.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{race.date} / Day {race.day}</p>
          </div>
          <p className="rounded-[var(--radius-md)] bg-[#f4f7ff] p-3 text-xs text-[var(--muted)]">
            {race.description}
          </p>
        </div>
      </section>

      <section className="flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
        <div className="flex items-center gap-2 pb-3 text-sm font-semibold text-[var(--foreground)]">
          <Info size={16} /> 出走予定選手
        </div>
        <div className="-mx-5">
          <RaceEntryTable entries={race.entries} />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[#f9fbff] p-4 text-xs text-[var(--muted)]">
        <p>
          将来的にはここにスタート展示や直前情報、体重調整などの速報を表示します。バックエンドからのリアルタイム情報を結び付けることを想定しています。
        </p>
      </section>
    </aside>
  );
}
