'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MessageSquare, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ChatSession {
  id: string;
  race_id: string;
  race_date: string;
  venue: string;
  race_number: number;
  race_name: string;
  created_at: string;
  last_accessed_at: string;
  message_count?: number;
}

export default function ChatListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchSessions = async () => {
    try {
      console.log('[Boat] チャット履歴取得開始');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v2/chat/sessions?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${session?.user?.email}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[Boat] チャット履歴取得成功:', data.sessions?.length);
        setSessions(data.sessions || []);
      } else {
        console.error('[Boat] チャット履歴取得エラー:', response.status);
      }
    } catch (error) {
      console.error('[Boat] チャット履歴取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">チャット履歴</h1>
          <p className="text-sm text-[var(--muted)]">
            過去に作成したチャットセッションの一覧です
          </p>
        </header>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[var(--muted)]" />
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              チャット履歴がありません
            </h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              レース一覧からチャットを作成してください
            </p>
            <Link
              href="/races"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d4fce]"
            >
              レース一覧へ
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((chatSession) => (
              <Link
                key={chatSession.id}
                href={`/chat/${chatSession.id}`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--brand-primary)] hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[var(--brand-primary)]" />
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {chatSession.venue} {chatSession.race_number}R
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-[var(--muted)] mb-3">
                  {chatSession.race_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(chatSession.race_date).toLocaleDateString('ja-JP')}</span>
                  {chatSession.message_count !== undefined && (
                    <>
                      <span>•</span>
                      <span>{chatSession.message_count}件のメッセージ</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
