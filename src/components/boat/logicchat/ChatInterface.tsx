'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';
import { Loader2, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { ChatMessage } from '@/types/chat';
import type { BoatRaceDetail } from '@/types/race';
import type { IMLogicSettingsData } from '@/types/logicchat';
import SlideUpPresetPanel from './SlideUpPresetPanel';

interface ChatInterfaceProps {
  sessionId: string;
  race: BoatRaceDetail;
  settings?: IMLogicSettingsData | null;
  initialMessages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
}

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
  race,
  settings,
  initialMessages,
  onMessagesUpdate,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  
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
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (!initialMessages || initialMessages.length === 0) return;
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    onMessagesUpdate?.(messages);
  }, [messages, onMessagesUpdate]);

  const sendMessage = useCallback(async (overrideMessage?: string) => {
    const messageToSend = overrideMessage || inputMessage.trim();
    if (!messageToSend) return;

    const newUserMessage = createUserMessage(messageToSend);
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setSending(true);

    try {
      // モック応答（将来的にはAPI呼び出しに置き換え）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = `【モック応答】
${messageToSend}に対する分析結果です。

艇:${settings?.horse_weight || 70}% / 選手:${settings?.jockey_weight || 30}% の重みで分析しました。

実際のエンジン連携時には、ここに詳細な分析結果が表示されます。`;

      const assistantMessage = createAssistantMessage(mockResponse);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      toast.error('メッセージの送信に失敗しました');
      const errorMessage = createAssistantMessage(
        'エンジンへの接続に失敗しました。通信環境を確認するか、後ほど再度お試しください。',
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  }, [inputMessage, settings]);

  const sendPresetMessage = useCallback((message: string) => {
    sendMessage(message);
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* メッセージエリア */}
      <div 
        className="flex-1 overflow-y-auto p-3 sm:p-4 pb-32 sm:pb-36 lg:pt-3 scroll-smooth"
        ref={chatContainerRef}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          minHeight: 0,
          overscrollBehavior: 'contain',
          backgroundColor: 'var(--background)'
        }}
      >
        {messages.length === 0 && !sending && (
          <div className="text-center py-8 sm:py-12 max-w-4xl mx-auto px-4">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-4">
              {race.venue} {race.day}R {race.title}
            </h3>
            
            <div className="bg-[var(--surface)] rounded-xl p-4 sm:p-6 mb-6 border border-[var(--border)]">
              <h4 className="text-lg font-bold text-[var(--brand-primary)] mb-4">🚀 使い方</h4>
              <div className="text-left text-sm text-[var(--muted)] space-y-2">
                <p>• 下の入力欄から自由に質問できます</p>
                <p>• 「分析オプションを表示」ボタンでプリセット質問を選択できます</p>
                <p>• 例: 「このレースの展開を教えて」「展示タイムを重視した順位予測を教えて」</p>
                <p>• モック版では簡易的な応答を返します</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="mb-4 sm:mb-6">
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === 'assistant'
                    ? 'bg-white text-[var(--foreground)] border border-[var(--border)] shadow-sm'
                    : 'bg-[var(--brand-primary)] text-white'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
            <div className={`text-xs text-[var(--muted)] mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              {message.role === 'assistant' ? 'D-Logic Boat' : 'You'} • {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-4">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-primary)]" />
            回答を生成しています...
          </div>
        )}

        {/* スクロールアンカー */}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア - 画面下固定 */}
      <div 
        className="fixed bottom-0 left-0 right-0 lg:right-[450px] xl:right-[550px] 2xl:right-[650px] border-t border-[var(--border)] bg-[var(--surface)] pb-3 sm:pb-4 md:pb-5 z-50"
        style={{ 
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(var(--surface-rgb), 0.98)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)'
        }}
      >
        {/* 入力フィールド */}
        <div id="chat-input-area" className="px-2 sm:px-3 md:px-4 pt-2 pb-2">
          <div className="relative">
            <SlideUpPresetPanel 
              onPresetClick={(message) => {
                sendPresetMessage(message);
              }}
              isOpen={isPanelOpen}
              setIsOpen={setIsPanelOpen}
            />
            
            <div className="flex items-center gap-2 max-w-full">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="例: 全艇分析して"
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent focus:outline-none transition-all duration-300"
                  disabled={sending}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || sending}
                className={`flex-shrink-0 p-2 sm:p-2.5 md:p-3 rounded-lg transition-all ${
                  !inputMessage.trim() || sending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--brand-primary)] text-white hover:bg-[#0d4fce] active:scale-95'
                } flex items-center justify-center`}
              >
                {sending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            
            {/* 開閉ボタン - 入力エリアの下に配置 */}
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="mt-2 w-full py-1.5 bg-[var(--background)] hover:bg-[var(--surface)] border border-[var(--border)] rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-[var(--muted)] hover:text-[var(--brand-primary)] text-xs sm:text-sm"
              type="button"
            >
              {isPanelOpen ? (
                <>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>分析オプションを閉じる</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>分析オプションを表示</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
