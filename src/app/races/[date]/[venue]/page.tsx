'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, MapPin, MessageSquare, Trophy } from 'lucide-react';
import { nanoid } from 'nanoid/non-secure';

import { getGroupedRacesByDate, getRacesByDateAndVenue } from '@/data/mock/races';
import { loadUserChatSessions, saveUserChatSessions } from '@/data/mock/chat';
import type { ChatSession } from '@/types/chat';

interface RaceListPageProps {
  params: Promise<{ date: string; venue: string }>;
}

// グレードバッジのスタイルを返す関数
function getGradeBadgeStyle(grade: string) {
  switch (grade) {
    case 'SG':
      return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg';
    case 'G1':
      return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg';
    case 'G2':
      return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg';
    case 'G3':
      return 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg';
    default:
      return 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]';
  }
}

export default function RaceListPage({ params }: RaceListPageProps) {
  const router = useRouter();
  const { date, venue } = use(params);

  const groupedRaces = getGroupedRacesByDate();
  const currentDateInfo = groupedRaces.find((g) => g.date === date);
  const allRaces = useMemo(() => getRacesByDateAndVenue(date, venue), [date, venue]);
  
  // 10月12日の鳴門のみ1R～3Rに制限（モック）
  const races = useMemo(() => {
    if (date === '2025-10-12' && venue === '鳴門') {
      return allRaces.filter(race => race.day <= 3);
    }
    return allRaces;
  }, [date, venue, allRaces]);

  const handleCreateChat = (raceId: string, raceTitle: string) => {
    const now = new Date().toISOString();
    const sessionId = `boat-${nanoid(10)}`;
    const newSession: ChatSession = {
      id: sessionId,
      raceId: raceId,
      raceTitle: raceTitle,
      createdAt: now,
      updatedAt: now,
      summary: `${venue} ${raceTitle}の分析チャット`,
      messages: [],
    };

    const userSessions = loadUserChatSessions();
    const updated = [newSession, ...userSessions];
    saveUserChatSessions(updated);
    router.push(`/chat/${sessionId}`);
  };

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

  if (races.length === 0) {
    return (
      <div className="bg-[var(--background)] min-h-screen py-12 text-[var(--foreground)]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
              レース情報が見つかりません
            </h2>
            <p className="text-[var(--muted)] mb-6">
              {venue}では{currentDateInfo.displayDate}のレースデータがありません。
            </p>
            <button
              type="button"
              onClick={() => router.push(`/races/${date}`)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d4fce]"
            >
              開催場選択に戻る
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
            href={`/races/${date}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            開催場選択に戻る
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[var(--brand-primary)]" />
              <h1 className="text-3xl font-bold text-[var(--foreground)]">{venue}</h1>
            </div>
            <div className="text-[var(--muted)]">|</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--muted)]" />
              <span className="text-xl text-[var(--foreground)]">{currentDateInfo.displayDate}</span>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">{races.length}レースが開催されています</p>
        </div>

        {/* レース一覧 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {races.map((race) => {
            const isMainRace = race.day === 10; // 10Rはメインレース
            const hasHighGrade = ['SG', 'G1', 'G2'].includes(race.grade);

            return (
              <div
                key={race.id}
                className={`rounded-2xl border p-6 transition-all ${
                  hasHighGrade
                    ? 'border-[var(--brand-primary)] bg-gradient-to-br from-[var(--surface)] to-[var(--background)] shadow-lg'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand-primary)] hover:shadow-md'
                }`}
              >
                {/* レースヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        hasHighGrade
                          ? 'bg-[var(--brand-primary)] text-white'
                          : 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                      }`}
                    >
                      <span className="font-bold text-lg">{race.day}R</span>
                    </div>
                    <div>
                      {/* グレードバッジ */}
                      <div className="mb-2">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${getGradeBadgeStyle(race.grade)}`}
                        >
                          {race.grade}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--foreground)] leading-tight line-clamp-2">
                        {race.title}
                      </h3>
                    </div>
                  </div>
                  <Trophy
                    className={`h-5 w-5 ${hasHighGrade ? 'text-[var(--brand-primary)]' : 'text-[var(--muted)]'}`}
                  />
                </div>

                {/* レース詳細 */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">天候:</span>
                    <span className="text-[var(--foreground)] font-medium">{race.weather}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">風速:</span>
                    <span className="text-[var(--foreground)]">{race.windSpeed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">波高:</span>
                    <span className="text-[var(--foreground)]">{race.waveHeight} cm</span>
                  </div>
                </div>

                {/* チャット作成ボタン */}
                <button
                  type="button"
                  onClick={() => handleCreateChat(race.id, race.title)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                    hasHighGrade
                      ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[#0d4fce] text-white shadow-lg hover:shadow-xl'
                      : 'bg-[var(--brand-primary)] text-white hover:bg-[#0d4fce]'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{isMainRace ? '🏆 メインレース分析' : 'チャット作成'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
