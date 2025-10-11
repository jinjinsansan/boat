'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { nanoid } from 'nanoid/non-secure';

import { ChatSessionList } from '@/components/boat/ChatSessionList';
import { ChatInterface } from '@/components/boat/chat/ChatInterface';
import { RaceSelector } from '@/components/boat/chat/RaceSelector';
import {
  getMockChatSessions,
  loadUserChatSessions,
  saveUserChatSessions,
} from '@/data/mock/chat';
import { getMockRaces } from '@/data/mock/races';
import type { BoatRaceDetail } from '@/types/race';
import type { ChatSession } from '@/types/chat';

type Step = 'race-select' | 'chat';

export default function ChatLobbyPage() {
  const races = useMemo(() => getMockRaces(), []);
  const baseSessions = useMemo(() => getMockChatSessions(), []);
  const [userSessions, setUserSessions] = useState<ChatSession[]>([]);
  const [step, setStep] = useState<Step>('race-select');
  const [selectedRace, setSelectedRace] = useState<BoatRaceDetail | null>(null);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUserSessions(loadUserChatSessions());
  }, []);

  const sessions = useMemo(() => {
    const map = new Map<string, ChatSession>();
    [...userSessions, ...baseSessions].forEach((session) => {
      map.set(session.id, session);
    });
    return Array.from(map.values()).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [userSessions, baseSessions]);

  const handleCreateSession = (race: BoatRaceDetail) => {
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: `boat-${nanoid(10)}`,
      raceId: race.id,
      raceTitle: `${race.venue} ${race.title}`,
      createdAt: now,
      updatedAt: now,
      summary: `${race.venue}${race.day}日目 ${race.grade} を分析するチャット`,
      messages: [],
    };

    const updatedUserSessions = [newSession, ...userSessions];
    setUserSessions(updatedUserSessions);
    saveUserChatSessions(updatedUserSessions);
    setSelectedRace(race);
    setStep('chat');
    router.push(`/chat/${newSession.id}`);
  };

  const existingSession = useMemo(() => {
    if (!selectedRace) return undefined;
    return sessions.find((session) => session.raceId === selectedRace.id);
  }, [selectedRace, sessions]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-[var(--brand-secondary)]">BOAT RACE AI CHAT</p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">レースを選んでAIチャットを開始</h1>
        <p className="text-sm text-[var(--muted)]">
          競馬版で構築したレース→チャットのフローを競艇版に移植したモックです。レースを選択すると参加選手のデータを添えてチャットが生成されます。
        </p>
      </header>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setStep('race-select');
            selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4fce]"
        >
          <Plus size={16} /> 新しいチャットを作成
        </button>
      </div>

      <section className="flex items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white px-6 py-4 text-sm font-semibold text-[var(--muted)]">
        <button
          type="button"
          onClick={() => setStep('race-select')}
          className={`rounded-full px-5 py-2 transition ${
            step === 'race-select'
              ? 'bg-[var(--brand-primary)] text-white'
              : 'bg-[#f4f7ff] text-[var(--foreground)] hover:bg-[#e3ebff]'
          }`}
        >
          1. レースを選択
        </button>
        <span className="text-xs">→</span>
        <button
          type="button"
          onClick={() => selectedRace && setStep('chat')}
          className={`rounded-full px-5 py-2 transition ${
            step === 'chat'
              ? 'bg-[var(--brand-primary)] text-white'
              : selectedRace
                ? 'bg-[#f4f7ff] text-[var(--foreground)] hover:bg-[#e3ebff]'
                : 'bg-[#f4f7ff] text-[#a0a8b8] cursor-not-allowed'
          }`}
          disabled={!selectedRace}
        >
          2. チャットを作成
        </button>
      </section>

      {step === 'race-select' && (
        <div ref={selectorRef}>
          <RaceSelector
            races={races}
            onSelect={(race) => handleCreateSession(race)}
          />
        </div>
      )}

      {step === 'chat' && selectedRace && (
        <ChatInterface
          race={selectedRace}
          initialMessages={existingSession?.messages ?? []}
        />
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">最近のチャット履歴</h2>
        <p className="text-sm text-[var(--muted)]">実際の運用ではここに Render / Supabase 上のチャットセッションを一覧表示します。</p>
        <ChatSessionList sessions={sessions} />
      </section>
    </div>
  );
}
