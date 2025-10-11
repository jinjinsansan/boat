'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ChatInterface } from '@/components/boat/logicchat/ChatInterface';
import { IMLogicSettings } from '@/components/boat/logicchat/IMLogicSettings';
import { RaceInfoPanel } from '@/components/boat/logicchat/RaceInfoPanel';
import {
  getMockChatSessionById,
  loadUserChatSessions,
  upsertUserChatSession,
} from '@/data/mock/chat';
import { getMockRaceById } from '@/data/mock/races';
import type { ChatSession } from '@/types/chat';
import type { IMLogicSettingsData } from '@/types/logicchat';
import type { BoatRaceDetail } from '@/types/race';

interface ChatDetailPageProps {
  params: Promise<{ sessionId: string }>;
}

type Step = 'settings' | 'chat';

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const router = useRouter();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [race, setRace] = useState<BoatRaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('settings');
  const [settings, setSettings] = useState<IMLogicSettingsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((value) => {
      if (!cancelled) setSessionId(value.sessionId);
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const base = getMockChatSessionById(sessionId);
    if (base) {
      setSession(base);
      setRace(getMockRaceById(base.raceId) ?? null);
      setLoading(false);
      return;
    }

    const stored = loadUserChatSessions();
    const found = stored.find((item) => item.id === sessionId) ?? null;
    setSession(found);
    setRace(found ? getMockRaceById(found.raceId) ?? null : null);
    setLoading(false);
  }, [sessionId]);

  const handleMessagesUpdate = useCallback(
    (messages: ChatSession['messages']) => {
      if (!session) return;
      const updated: ChatSession = {
        ...session,
        messages,
        updatedAt: new Date().toISOString(),
      };
      setSession(updated);
      upsertUserChatSession(updated);
    },
    [session],
  );

  const headerContent = useMemo(() => {
    if (!session || !race) return null;
    return (
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Boat Chat Session</p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{session.raceTitle}</h1>
        <p className="text-sm text-[var(--muted)]">{session.summary}</p>
        <Link
          href={`/races/${race.id}`}
          className="text-xs font-semibold text-[var(--brand-primary)]"
        >
          対象レースを見る →
        </Link>
      </header>
    );
  }, [session, race]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--background)] text-sm text-[var(--muted)]">
        読み込み中...
      </div>
    );
  }

  if (!session || !race || !sessionId) {
    return (
      <div className="bg-[var(--background)] py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)] shadow-sm">
          指定されたチャットセッションが見つかりませんでした。
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d4fce]"
          >
            チャット一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] py-12 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        {headerContent}

        <section className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4 text-xs text-[var(--muted)] shadow-sm">
          <button
            type="button"
            onClick={() => setStep('settings')}
            className={`rounded-full px-4 py-2 transition ${
              step === 'settings' ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'bg-[var(--background)] text-[var(--foreground)]'
            }`}
          >
            1. IMLogic 設定
          </button>
          <span>→</span>
          <button
            type="button"
            onClick={() => settings && setStep('chat')}
            className={`rounded-full px-4 py-2 transition ${
              step === 'chat'
                ? 'bg-[var(--brand-primary)] text-white font-semibold'
                : settings
                  ? 'bg-[var(--background)] text-[var(--foreground)]'
                  : 'bg-[var(--background)] text-[#aab4c5] cursor-not-allowed'
            }`}
            disabled={!settings}
          >
            2. チャット分析
          </button>
        </section>

        {step === 'settings' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <IMLogicSettings
                raceName={race.title}
                onComplete={(value) => {
                  setSettings(value);
                  setStep('chat');
                }}
              />
            </div>
            <RaceInfoPanel race={race} />
          </div>
        )}

        {step === 'chat' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ChatInterface
              sessionId={sessionId}
              race={race}
              settings={settings}
              initialMessages={session.messages}
              onMessagesUpdate={handleMessagesUpdate}
            />
            <RaceInfoPanel race={race} />
          </div>
        )}
      </div>
    </div>
  );
}
