'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ChatInterface } from '@/components/boat/logicchat/ChatInterface';
import IMLogicSettings from '@/components/boat/logicchat/IMLogicSettings';
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
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)]">
      <RaceInfoPanel race={race} onPanelStateChange={setIsPanelOpen} />

      <div className="sticky top-[64px] z-30 bg-[var(--surface)] backdrop-blur-lg shadow-lg border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setStep('settings')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all hover:bg-[var(--background)] ${
                step === 'settings'
                  ? 'bg-[var(--brand-primary)] text-white font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <span className="text-sm font-medium">1. 設定</span>
            </button>
            <span className="text-[var(--muted)]">→</span>
            <button
              onClick={() => settings && setStep('chat')}
              disabled={!settings}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all hover:bg-[var(--background)] ${
                step === 'chat'
                  ? 'bg-[var(--brand-primary)] text-white font-semibold'
                  : settings
                    ? 'text-[var(--muted)] hover:text-[var(--foreground)]'
                    : 'text-[#aab4c5] cursor-not-allowed'
              }`}
            >
              <span className="text-sm font-medium">2. 分析</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className={`transition-all duration-300 ${isPanelOpen ? 'lg:mr-96' : ''}`}>
          {headerContent && <div className="mb-8">{headerContent}</div>}

          {step === 'settings' && (
            <div className="bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] p-8">
              <IMLogicSettings
                raceInfo={race}
                onComplete={(value: IMLogicSettingsData) => {
                  setSettings(value);
                  setStep('chat');
                }}
              />
            </div>
          )}

          {step === 'chat' && (
            <div className="bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden">
              <div className="h-[calc(100vh-240px)]">
                <ChatInterface
                  sessionId={sessionId}
                  race={race}
                  settings={settings}
                  initialMessages={session.messages}
                  onMessagesUpdate={handleMessagesUpdate}
                  isPanelOpen={isPanelOpen}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
