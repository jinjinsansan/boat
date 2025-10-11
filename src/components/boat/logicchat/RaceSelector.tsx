'use client';

import { useMemo, useState } from 'react';
import { Calendar, Filter, MapPin, Trophy } from 'lucide-react';

import type { BoatRaceDetail } from '@/types/race';

interface RaceSelectorProps {
  races: BoatRaceDetail[];
  onSelect: (race: BoatRaceDetail) => void;
}

export function RaceSelector({ races, onSelect }: RaceSelectorProps) {
  const [venue, setVenue] = useState<string>('');
  const [grade, setGrade] = useState<string>('');

  const venues = useMemo(
    () => Array.from(new Set(races.map((race) => race.venue))).sort(),
    [races],
  );

  const grades = useMemo(
    () => Array.from(new Set(races.map((race) => race.grade))),
    [races],
  );

  const filtered = useMemo(() => {
    return races.filter((race) => {
      if (venue && race.venue !== venue) return false;
      if (grade && race.grade !== grade) return false;
      return true;
    });
  }, [races, venue, grade]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#B7BDC6]">
            開催場
          </span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#848E9C]" />
            <select
              value={venue}
              onChange={(event) => setVenue(event.target.value)}
              className="w-full appearance-none rounded-lg border border-[#2B3139] bg-[#0B0E11] py-2 pl-10 pr-8 text-sm text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
            >
              <option value="">すべて</option>
              {venues.map((current) => (
                <option key={current} value={current}>
                  {current}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#B7BDC6]">
            グレード
          </span>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#848E9C]" />
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="w-full appearance-none rounded-lg border border-[#2B3139] bg-[#0B0E11] py-2 pl-10 pr-8 text-sm text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
            >
              <option value="">すべて</option>
              {grades.map((current) => (
                <option key={current} value={current}>
                  {current}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="hidden md:block" />
      </div>

      <div className="space-y-4">
        {filtered.map((race) => (
          <button
            key={race.id}
            type="button"
            onClick={() => onSelect(race)}
            className="w-full rounded-2xl border border-[#2B3139] bg-[#181A20] p-6 text-left transition hover:border-[#F0B90B] hover:shadow-lg"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#B7BDC6]">
                  <span>
                    {new Date(race.date).toLocaleDateString('ja-JP', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span>{race.venue}</span>
                  <span>•</span>
                  <span>{race.grade}</span>
                  <span>•</span>
                  <span>Day {race.day}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#EAECEF]">{race.title}</h3>
                <p className="text-sm text-[#848E9C]">風 {race.windSpeed}m/s / 波 {race.waveHeight}cm</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#B7BDC6]">
                <span>{race.entries.length}艇</span>
                <Trophy className="h-5 w-5 text-[#F0B90B]" />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#0B0E11] p-4 text-xs text-[#B7BDC6]">
              <p className="mb-2 font-semibold text-[#EAECEF]">出走予定選手</p>
              <div className="grid gap-2 md:grid-cols-2">
                {race.entries.map((entry) => (
                  <div key={entry.registerNumber} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0B90B]/10 text-sm font-semibold text-[#F0B90B]">
                      {entry.lane}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-[#EAECEF]">{entry.racerName}</p>
                      <p className="text-[10px] uppercase text-[#848E9C]">
                        登録 {entry.registerNumber} / {entry.branch} / モーター {entry.motorNo}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-[#B7BDC6]">
                      <p>機 {entry.motorWinRate.toFixed(1)}%</p>
                      <p>艇 {entry.boatWinRate.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#2B3139] bg-[#181A20] p-6 text-center text-sm text-[#B7BDC6]">
            条件に合うレースがありません。
          </div>
        )}
      </div>
    </div>
  );
}
