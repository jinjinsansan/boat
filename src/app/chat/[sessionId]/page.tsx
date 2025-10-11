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
        <p className="text-xs uppercase tracking-wide text-[#B7BDC6]">Boat Chat Session</p>
        <h1 className="text-3xl font-semibold text-white">{session.raceTitle}</h1>
        <p className="text-sm text-[#848E9C]">{session.summary}</p>
        <Link
          href={`/races/${race.id}`}
          className="text-xs font-semibold text-[#F0B90B]"
        >
          対象レースを見る →
        </Link>
      </header>
    );
  }, [session, race]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0B0E11] text-sm text-[#B7BDC6]">
        読み込み中...
      </div>
    );
  }

  if (!session || !race || !sessionId) {
    return (
      <div className="bg-[#0B0E11] py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#2B3139] bg-[#181A20] p-8 text-sm text-[#B7BDC6]">
          指定されたチャットセッションが見つかりませんでした。
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F0B90B] px-4 py-2 text-sm font-semibold text-black"
          >
            チャット一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0E11] py-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        {headerContent}

        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#2B3139] bg-[#181A20] px-6 py-4 text-xs text-[#B7BDC6]">
          <button
            type="button"
            onClick={() => setStep('settings')}
            className={`rounded-full px-4 py-2 transition ${
              step === 'settings' ? 'bg-[#F0B90B] text-black font-semibold' : 'bg-[#0B0E11] text-white'
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
                ? 'bg-[#F0B90B] text-black font-semibold'
                : settings
                  ? 'bg-[#0B0E11] text-white'
                  : 'bg-[#0B0E11] text-[#4f5665] cursor-not-allowed'
            }`}
            disabled={!settings}
          >
            2. チャット分析
          </button>
        </section>

        {step === 'settings' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-[#2B3139] bg-[#181A20] p-6">
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
