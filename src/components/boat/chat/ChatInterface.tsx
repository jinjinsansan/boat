'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';

import type { BoatRaceDetail } from '@/types/race';
import type { ChatMessage, ChatPreset } from '@/types/chat';
import {
  createMockAssistantMessage,
  createMockUserMessage,
  mockChatPresets,
} from '@/data/mock/chat';
import { RaceInfoPanel } from '@/components/boat/chat/RaceInfoPanel';
import { PresetPanel } from '@/components/boat/chat/PresetPanel';

interface ChatInterfaceProps {
  race: BoatRaceDetail;
  initialMessages?: ChatMessage[];
  presets?: ChatPreset[];
}

export function ChatInterface({ race, initialMessages = [], presets }: ChatInterfaceProps) {
  const defaultPresets = presets ?? mockChatPresets;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const starterMessage: ChatMessage = {
      id: `assistant-${race.id}`,
      role: 'assistant',
      content: `${race.title} のAI分析チャットを開始しました。スタート展示や機力評価など、気になるポイントを質問してください。`,
      createdAt: new Date().toISOString(),
    };
    setMessages(initialMessages.length > 0 ? [...initialMessages] : [starterMessage]);
    setInputValue('');
  }, [race, initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content?: string) => {
    const text = (content ?? inputValue).trim();
    if (!text || sending) return;

    const userMessage = createMockUserMessage(text);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    const assistantMessage = createMockAssistantMessage(text);
    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMessage]);
      setSending(false);
    }, 600);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend();
  };

  const participants = useMemo(
    () =>
      race.entries.map((entry) => ({
        registerNumber: entry.registerNumber,
        name: entry.racerName,
        lane: entry.lane,
      })),
    [race.entries],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)]">
      <div className="flex flex-col gap-6">
        <PresetPanel
          presets={defaultPresets}
          onSelect={(preset) => handleSend(preset.message)}
        />

        <section className="flex h-[620px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
          <header className="border-b border-[var(--border)] bg-[#f9fbff] px-5 py-4">
            <div className="flex flex-col gap-1 text-sm">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">チャットセッション</p>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{race.title}</h2>
              <p className="text-xs text-[var(--muted)]">
                参加選手: {participants.map((participant) => `${participant.lane}号艇${participant.name}`).join(' / ')}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === 'user'
                      ? 'ml-auto max-w-[85%] rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-4 py-3 text-sm text-white shadow'
                      : 'max-w-[85%] rounded-[var(--radius-md)] bg-[#f4f7ff] px-4 py-3 text-sm text-[var(--foreground)] shadow-sm'
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <span className="mt-2 block text-right text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <footer className="border-t border-[var(--border)] bg-white px-5 py-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="例: ダッシュ勢の仕掛けを想定した買い目を教えて"
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || inputValue.trim().length === 0}
                className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4fce] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}送信
              </button>
            </form>
          </footer>
        </section>
      </div>

      <RaceInfoPanel race={race} />
    </div>
  );
}
