'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { nanoid } from 'nanoid/non-secure';

import { ChatSessionList } from '@/components/boat/ChatSessionList';
import { RaceSelector } from '@/components/boat/logicchat/RaceSelector';
import {
  getMockChatSessions,
  loadUserChatSessions,
  saveUserChatSessions,
} from '@/data/mock/chat';
import { getMockRaceById, getMockRaces } from '@/data/mock/races';
import type { BoatRaceDetail } from '@/types/race';
import type { ChatSession } from '@/types/chat';

export default function ChatLobbyPage() {
  const router = useRouter();
  const baseSessions = useMemo(() => getMockChatSessions(), []);
  const [userSessions, setUserSessions] = useState<ChatSession[]>([]);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  const raceDetails = useMemo(() => {
    const summaries = getMockRaces();
    return summaries
      .map((summary) => getMockRaceById(summary.id))
      .filter((race): race is BoatRaceDetail => Boolean(race));
  }, []);

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

  const handleSelectRace = (race: BoatRaceDetail) => {
    const now = new Date().toISOString();
    const sessionId = `boat-${nanoid(10)}`;
    const newSession: ChatSession = {
      id: sessionId,
      raceId: race.id,
      raceTitle: `${race.venue} ${race.title}`,
      createdAt: now,
      updatedAt: now,
      summary: `${race.venue}${race.day}日目 ${race.grade} の構成を分析するチャット`,
      messages: [],
    };

    const updated = [newSession, ...userSessions];
    setUserSessions(updated);
    saveUserChatSessions(updated);
    router.push(`/chat/${sessionId}`);
  };

  return (
    <div className="bg-[#0B0E11] py-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-[#B7BDC6]">Boat Logic Chat</p>
          <h1 className="text-3xl font-semibold">レースを選択してチャットを開始</h1>
          <p className="text-sm text-[#848E9C]">
            競馬版 UX をそのまま移植したモック環境です。レースを選ぶと固有のチャットセッション URL が生成されます。
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex items-center gap-2 rounded-full bg-[#F0B90B] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#FCD535]"
          >
            <Plus className="h-4 w-4" /> 新しいチャットを作成
          </button>
        </div>

        <section className="rounded-2xl border border-[#2B3139] bg-[#181A20] px-6 py-4 text-sm text-[#B7BDC6]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#0B0E11] px-4 py-1 text-xs font-semibold text-white">STEP 1</span>
            <span>レースを選択してセッションを作成</span>
          </div>
        </section>

        <div ref={selectorRef}>
          <RaceSelector races={raceDetails} onSelect={handleSelectRace} />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">最近のチャット履歴</h2>
            <span className="text-xs text-[#848E9C]">ローカルストレージに保存されています</span>
          </div>
          <ChatSessionList sessions={sessions} />
        </section>
      </div>
    </div>
  );
}
