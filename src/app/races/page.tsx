'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';

import { getGroupedRacesByDate } from '@/data/mock/races';

export default function RacesPage() {
  const groupedRaces = getGroupedRacesByDate();
  const [expandedDate, setExpandedDate] = useState<string | null>(
    groupedRaces.length > 0 ? groupedRaces[0].date : null
  );

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

        {/* 日付リスト（アコーディオン） */}
        <div className="space-y-4">
          {groupedRaces.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)]">
              現在、開催予定のレースはありません。
            </div>
          ) : (
            groupedRaces.map((group) => {
              const isExpanded = expandedDate === group.date;
              const isLatest = group === groupedRaces[0];

              return (
                <div
                  key={group.date}
                  className={`rounded-2xl border transition-all ${
                    isLatest
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-sm'
                      : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                >
                  {/* 日付ヘッダー（クリック可能） */}
                  <button
                    type="button"
                    onClick={() => setExpandedDate(isExpanded ? null : group.date)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--background)]/50 transition-colors rounded-t-2xl"
                  >
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
                    <div className="flex items-center gap-2">
                      {!isExpanded && (
                        <span className="text-sm font-semibold text-[var(--brand-primary)]">
                          レースを見る
                        </span>
                      )}
                      <ChevronRight
                        className={`h-5 w-5 text-[var(--muted)] transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* 展開コンテンツ（開催場リスト） */}
                  {isExpanded && (
                    <div className="border-t border-[var(--border)] px-6 py-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.venues.map((venue) => (
                          <Link
                            key={venue}
                            href={`/races/${group.date}/${venue}`}
                            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition hover:border-[var(--brand-primary)] hover:bg-[var(--surface)]"
                          >
                            <span className="font-semibold text-[var(--foreground)]">{venue}</span>
                            <ChevronRight className="h-4 w-4 text-[var(--brand-primary)]" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setExpandedDate(null)}
                          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
                        >
                          閉じる
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
