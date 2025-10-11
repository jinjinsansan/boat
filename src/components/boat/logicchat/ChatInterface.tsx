'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';
import { Loader2, SendHorizonal, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { ChatMessage } from '@/types/chat';
import type { BoatRaceDetail } from '@/types/race';
import type { IMLogicSettingsData } from '@/types/logicchat';

interface ChatInterfaceProps {
  sessionId: string;
  race: BoatRaceDetail;
  settings?: IMLogicSettingsData | null;
  initialMessages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
  isPanelOpen?: boolean;
}

const PRESET_MESSAGES = [
  'このレースでイン逃げを阻止できる選手は誰？',
  'まくりが決まる可能性を評価して',
  '展示タイムを重視した順位予測を教えて',
  '直近10走の成績から注目艇をピックアップして',
];

const createAssistantMessage = (content: string): ChatMessage => ({
  id: `assistant-${nanoid(12)}`,
  role: 'assistant',
  content,
  createdAt: new Date().toISOString(),
});

const createUserMessage = (content: string): ChatMessage => ({
  id: `user-${nanoid(12)}`,
  role: 'user',
  content,
  createdAt: new Date().toISOString(),
});

export function ChatInterface({
  sessionId,
  race,
  settings,
  initialMessages,
  onMessagesUpdate,
  isPanelOpen = false,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    return [
      createAssistantMessage(
        '競馬版の UX を移植したモックチャットです。レース情報をもとに分析のシナリオを試せます。プリセットや自由入力で質問してみてください。',
      ),
    ];
  });
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [activeTab, setActiveTab] = useState<'imlogic' | 'viewlogic'>('imlogic');

  useEffect(() => {
    if (!initialMessages || initialMessages.length === 0) return;
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    onMessagesUpdate?.(messages);
  }, [messages, onMessagesUpdate]);

  const placeholder = useMemo(() => {
    if (settings) {
      return `艇:${settings.horse_weight}% / 選手:${settings.jockey_weight}% の重みで分析します…`;
    }
    return '例: まくり差しが決まる展開を教えて';
  }, [settings]);

  const sendMessage = useCallback(async (prompt: string, viaPreset = false) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const newMessages: ChatMessage[] = [...messages, createUserMessage(trimmed)];
    setMessages(newMessages);
    setInput('');
    setPending(true);

    try {
      const payload = {
        raceId: race.id,
        prompt: trimmed,
        settings,
        participants: race.entries.map((entry) => ({
          registerNumber: entry.registerNumber,
          racerName: entry.racerName,
          lane: entry.lane,
          branch: entry.branch,
          motorNo: entry.motorNo,
          boatNo: entry.boatNo,
          motorWinRate: entry.motorWinRate,
          boatWinRate: entry.boatWinRate,
        })),
      };

      const response = await fetch('/api/engines/boat-dlogic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const answer = typeof data?.message === 'string'
          ? data.message
          : data?.data?.analysis?.summary || '詳細な分析結果はバックエンド連携後に表示されます。';
        setMessages((prev) => [
          ...prev,
          createAssistantMessage(answer),
        ]);
        toast.success(viaPreset ? 'プリセット分析を実行しました' : '回答を生成しました');
      } else {
        const errorBody = await response.json().catch(() => null);
        const errorMessage = errorBody?.error || '分析エンジンの準備中です。モック回答を表示します。';
        setMessages((prev) => [
          ...prev,
          createAssistantMessage(`${errorMessage}\n\n・本番環境では競馬版と同じ IMLogic / ViewLogic エンジンが接続されます。`),
        ]);
        toast.error('バックエンドがまだ接続されていません');
      }
    } catch (error) {
      console.error('[boat-chat] engine request failed', error);
      setMessages((prev) => [
        ...prev,
        createAssistantMessage(
          'エンジンへの接続に失敗しました。通信環境を確認するか、後ほど再度お試しください。仮回答として艇番別のキーポイントを提示します。',
        ),
      ]);
    } finally {
      setPending(false);
    }
  }, [messages, race, settings]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 rounded-full bg-[var(--background)] p-1 text-sm text-[var(--muted)] mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('imlogic')}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            activeTab === 'imlogic' ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'hover:text-[var(--foreground)]'
          }`}
        >
          IMLogic
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('viewlogic')}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            activeTab === 'viewlogic' ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'hover:text-[var(--foreground)]'
          }`}
        >
          ViewLogic
        </button>
      </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" /> プリセット分析
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PRESET_MESSAGES.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => sendMessage(preset, true)}
                disabled={pending}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm text-[var(--foreground)] transition hover:border-[var(--brand-primary)] disabled:opacity-60"
              >
                {preset}
              </button>
            ))}
          </div>
        </section>

        <section className={`flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 ${
          isPanelOpen ? 'lg:pr-96' : 'lg:pr-4'
        }`}>
          <div className="h-full overflow-y-auto px-6 py-6 text-sm text-[var(--foreground)]">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-2">
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed ${
                      message.role === 'assistant'
                        ? 'self-start border border-[var(--border)] bg-white text-[var(--foreground)] shadow-sm'
                        : 'self-end bg-[var(--brand-primary)] text-white'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {message.role === 'assistant' ? 'D-Logic Boat' : 'You'} • {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
              {pending && (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-primary)]" /> 回答を生成しています...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </section>

        <form
          className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(input);
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
          />
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>エンジン連携の準備中はモック回答を返します。</span>
            <button
              type="submit"
              disabled={pending || input.trim() === ''}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d4fce] disabled:cursor-not-allowed disabled:opacity-60"
            >
              送信 <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
        </form>
    </div>
  );
}
