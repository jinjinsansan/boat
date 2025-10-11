'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChatInterface } from "@/components/boat/chat/ChatInterface";
import {
  getMockChatSessionById,
  loadUserChatSessions,
} from "@/data/mock/chat";
import { getMockRaceById } from "@/data/mock/races";
import type { ChatSession } from "@/types/chat";
import type { BoatRaceDetail } from "@/types/race";

interface ChatDetailPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const router = useRouter();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [race, setRace] = useState<BoatRaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  const headerContent = useMemo(() => {
    if (!session || !race) return null;
    return (
      <header className="space-y-2">
        <p className="text-sm font-semibold text-[var(--brand-secondary)]">CHAT SESSION</p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{session.raceTitle}</h1>
        <p className="text-sm text-[var(--muted)]">{session.summary}</p>
        <Link
          href={`/races/${race.id}`}
          className="text-sm font-semibold text-[var(--brand-primary)]"
        >
          対象レースを見る →
        </Link>
      </header>
    );
  }, [session, race]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12 text-sm text-[var(--muted)]">
        読み込み中...
      </div>
    );
  }

  if (!session || !race) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          指定されたチャットセッションは見つかりませんでした。
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            チャット一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      {headerContent}
      <ChatInterface race={race} initialMessages={session.messages} />
    </div>
  );
}
