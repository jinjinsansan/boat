'use client';

import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';

import { getGroupedRacesByDate } from '@/data/mock/races';

export default function RacesPage() {
  const groupedRaces = getGroupedRacesByDate();

  return (
    <div className="bg-[var(--background)] min-h-screen py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl px-6">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-[var(--brand-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">レース情報</h1>
          </div>
          <p className="text-sm text-[var(--muted)]">
            開催日を選択して、レーススケジュールを確認できます。
          </p>
        </header>

        {/* 日付リスト */}
        <div className="space-y-4">
          {groupedRaces.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)]">
              現在、開催予定のレースはありません。
            </div>
          ) : (
            groupedRaces.map((group) => {
              const isLatest = group === groupedRaces[0];

              return (
                <Link
                  key={group.date}
                  href={`/races/${group.date}`}
                  className={`block rounded-2xl border transition-all hover:shadow-md ${
                    isLatest
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-sm'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand-primary)]'
                  }`}
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      {isLatest && (
                        <span className="rounded-full bg-[var(--brand-primary)] px-3 py-1 text-xs font-semibold text-white">
                          最新の開催レース
                        </span>
                      )}
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-[var(--foreground)]">
                          {group.displayDate}
                        </h2>
                        <p className="text-sm text-[var(--muted)] mt-1">
                          {group.venues.join('・')} - 全{group.totalRaces}レース
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--brand-primary)]" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
