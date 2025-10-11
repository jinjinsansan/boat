'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Filter, MapPin, Wind } from 'lucide-react';

import type { BoatRaceDetail, BoatRaceSummary } from '@/types/race';
import { getMockRaceById } from '@/data/mock/races';

interface RaceSelectorProps {
  races: BoatRaceSummary[];
  onSelect: (race: BoatRaceDetail) => void;
}

const gradeLabels: Record<string, string> = {
  SG: 'SG',
  G1: 'G1',
  G2: 'G2',
  G3: 'G3',
  一般: '一般',
};

export function RaceSelector({ races, onSelect }: RaceSelectorProps) {
  const [venueFilter, setVenueFilter] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const venues = useMemo(
    () => Array.from(new Set(races.map((race) => race.venue))).sort(),
    [races],
  );

  const filteredRaces = useMemo(() => {
    return races.filter((race) => {
      const matchesVenue = !venueFilter || race.venue === venueFilter;
      const matchesGrade = !gradeFilter || race.grade === gradeFilter;
      const matchesStatus = !statusFilter || race.status === statusFilter;
      const matchesSearch =
        search.trim().length === 0 ||
        race.title.toLowerCase().includes(search.toLowerCase()) ||
        race.venue.toLowerCase().includes(search.toLowerCase());

      return matchesVenue && matchesGrade && matchesStatus && matchesSearch;
    });
  }, [races, venueFilter, gradeFilter, statusFilter, search]);

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">レースを絞り込む</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase text-[var(--muted)]">検索</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="開催名や会場で検索"
              className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase text-[var(--muted)]">開催場</label>
            <select
              value={venueFilter}
              onChange={(event) => setVenueFilter(event.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="">すべて</option>
              {venues.map((venue) => (
                <option key={venue} value={venue}>
                  {venue}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase text-[var(--muted)]">グレード</label>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="">すべて</option>
              {Object.keys(gradeLabels).map((grade) => (
                <option key={grade} value={grade}>
                  {gradeLabels[grade]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase text-[var(--muted)]">ステータス</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="">すべて</option>
              <option value="upcoming">開催前</option>
              <option value="live">開催中</option>
              <option value="finished">終了</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span>{filteredRaces.length} 件表示</span>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRaces.map((race) => {
          const detail = getMockRaceById(race.id);
          if (!detail) return null;
          return (
            <button
              key={race.id}
              type="button"
              onClick={() => onSelect(detail)}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-lg"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0f62fe]/10 px-3 py-1 text-xs font-semibold text-[#0f62fe]">
                    {race.grade}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                    <CalendarDays size={14} />
                    {race.date}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                    <MapPin size={14} />
                    {race.venue}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                    <Wind size={14} />
                    風 {race.windSpeed}m/s / 波 {race.waveHeight}cm
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">{race.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Day {race.day} / ステータス: {race.status === 'live' ? '開催中' : race.status === 'finished' ? '終了' : '開催前'}
                  </p>
                </div>

                <div className="grid gap-2 rounded-[var(--radius-md)] bg-[#f4f7ff] p-3 text-xs text-[var(--muted)]">
                  <p>AI 推奨指数: <span className="font-semibold text-[var(--foreground)]">{race.aiRank}/5</span></p>
                  <p>{detail.description}</p>
                </div>

                <div className="flex justify-end">
                  <span className="rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white">
                    このレースでチャットを作成
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
