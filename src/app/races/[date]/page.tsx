'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, MapPin, Trophy } from 'lucide-react';

import { getGroupedRacesByDate, getRacesByDateAndVenue } from '@/data/mock/races';

interface VenuePageProps {
  params: Promise<{ date: string }>;
}

export default function VenueSelectionPage({ params }: VenuePageProps) {
  const router = useRouter();
  const { date } = use(params);

  const groupedRaces = getGroupedRacesByDate();
  const currentDateInfo = groupedRaces.find((g) => g.date === date);

  const venuesWithRaces = useMemo(() => {
    if (!currentDateInfo) return [];

    return currentDateInfo.venues.map((venue) => {
      const races = getRacesByDateAndVenue(date, venue);
      return {
        venue,
        raceCount: races.length,
        highestGrade: races.reduce((highest, race) => {
          const gradeOrder: Record<string, number> = { SG: 5, G1: 4, G2: 3, G3: 2, 一般: 1 };
          const currentOrder = gradeOrder[race.grade] || 0;
          const highestOrder = gradeOrder[highest] || 0;
          return currentOrder > highestOrder ? race.grade : highest;
        }, '一般' as string),
      };
    });
  }, [date, currentDateInfo]);

  if (!currentDateInfo) {
    return (
      <div className="bg-[var(--background)] min-h-screen py-12 text-[var(--foreground)]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
              レース情報が見つかりません
            </h2>
            <p className="text-[var(--muted)] mb-6">指定された日付のレースデータがありません。</p>
            <button
              type="button"
              onClick={() => router.push('/races')}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d4fce]"
            >
              日付選択に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl px-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/races"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            日付選択に戻る
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-6 w-6 text-[var(--brand-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">{currentDateInfo.displayDate}</h1>
          </div>
          <p className="text-sm text-[var(--muted)]">開催場を選択してください</p>
        </div>

        {/* 開催場選択カード */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venuesWithRaces.map(({ venue, raceCount, highestGrade }) => (
            <Link
              key={venue}
              href={`/races/${date}/${venue}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--brand-primary)] hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[var(--brand-primary)]/10 p-3">
                    <MapPin className="h-6 w-6 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--brand-primary)] transition">
                      {venue}
                    </h2>
                    <p className="text-sm text-[var(--muted)]">{raceCount}レース開催</p>
                  </div>
                </div>
                <Trophy className="h-5 w-5 text-[var(--muted)] group-hover:text-[var(--brand-primary)] transition" />
              </div>

              {/* グレード表示 */}
              {highestGrade !== '一般' && (
                <div className="mb-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${
                      highestGrade === 'SG'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700'
                        : highestGrade === 'G1'
                          ? 'bg-gradient-to-r from-red-600 to-red-700'
                          : highestGrade === 'G2'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                            : 'bg-gradient-to-r from-green-600 to-green-700'
                    }`}
                  >
                    {highestGrade}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--brand-primary)] group-hover:text-[#0d4fce] transition font-medium">
                  このレース場を選択 →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
