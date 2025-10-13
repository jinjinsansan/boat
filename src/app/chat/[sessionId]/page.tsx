'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, MessageSquare, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface ChatDetailPageProps {
  params: Promise<{ sessionId: string }>;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ai_type?: string;
  created_at: string;
}

interface ChatSessionDetail {
  id: string;
  user_id: string;
  race_id: string;
  race_date: string;
  venue: string;
  race_number: number;
  race_name: string;
  points_consumed: number;
  created_at: string;
  last_accessed_at: string;
  enabled_chats: Record<string, boolean>;
  imlogic_settings_id?: string | null;
  race_snapshot: {
    weather?: string;
    wind_speed?: number;
    wave_height?: number;
    [key: string]: any;
  };
  user_email: string;
  messages: ChatMessage[];
}

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { sessionId } = use(params);
  
  const [chatSession, setChatSession] = useState<ChatSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchChatSession();
    }
  }, [status, session, sessionId, router]);

  const fetchChatSession = async () => {
    try {
      console.log('[Boat] チャットセッション取得開始:', sessionId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v2/chat/session/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.user?.email}`
          }
        }
      );

      if (response.ok) {
        const data: ChatSessionDetail = await response.json();
        console.log('[Boat] チャットセッション取得成功:', data);
        setChatSession(data);
      } else if (response.status === 404) {
        setError('指定されたチャットセッションが見つかりませんでした');
      } else {
        setError('チャットセッションの取得に失敗しました');
      }
    } catch (error) {
      console.error('[Boat] チャットセッション取得エラー:', error);
      setError('チャットセッションの取得に失敗しました');
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

  if (error || !chatSession) {
    return (
      <div className="bg-[var(--background)] min-h-screen py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[var(--muted)]" />
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {error || '指定されたチャットセッションが見つかりませんでした'}
            </h2>
            <Link
              href="/chat"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d4fce]"
            >
              チャット一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl px-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition mb-4"
          >
            ← チャット一覧へ戻る
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-[var(--brand-primary)]" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {chatSession.venue} {chatSession.race_number}R
              </h1>
              <p className="text-sm text-[var(--muted)]">{chatSession.race_name}</p>
            </div>
          </div>
          
          {/* レース情報 */}
          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(chatSession.race_date).toLocaleDateString('ja-JP')}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{chatSession.venue}</span>
            </div>
            {chatSession.race_snapshot?.weather && (
              <span>天気: {chatSession.race_snapshot.weather}</span>
            )}
            {chatSession.race_snapshot?.wind_speed !== undefined && (
              <span>風速: {chatSession.race_snapshot.wind_speed}m/s</span>
            )}
            {chatSession.race_snapshot?.wave_height !== undefined && (
              <span>波高: {chatSession.race_snapshot.wave_height}cm</span>
            )}
          </div>
        </div>

        {/* チャット表示エリア */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
          {chatSession.messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[var(--muted)]" />
              <p className="text-[var(--muted)]">まだメッセージがありません</p>
              <p className="text-sm text-[var(--muted)] mt-2">
                チャット機能は開発中です
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[var(--brand-primary)] text-white ml-auto max-w-[80%]'
                      : 'bg-[var(--background)] text-[var(--foreground)] mr-auto max-w-[80%]'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.created_at).toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
