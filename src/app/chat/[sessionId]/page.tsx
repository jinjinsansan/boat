'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Award, ChevronUp, ChevronDown } from 'lucide-react';

import { ChatInterface } from '@/components/boat/logicchat/ChatInterface';
import IMLogicSettings from '@/components/boat/logicchat/IMLogicSettings';
import type { ChatSession } from '@/types/chat';
import type { IMLogicSettingsData } from '@/types/logicchat';
import type { BoatRaceDetail } from '@/types/race';

interface ChatDetailPageProps {
  params: Promise<{ sessionId: string }>;
}

type Step = 'settings' | 'chat';

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const router = useRouter();
  const { data: authSession, status } = useSession();
  const { sessionId } = use(params);
  
  const [session, setSession] = useState<ChatSession | null>(null);
  const [race, setRace] = useState<BoatRaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('settings');
  const [settings, setSettings] = useState<IMLogicSettingsData | null>(null);
  const [showMobileRaceTable, setShowMobileRaceTable] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && authSession?.user?.email && sessionId) {
      fetchChatSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, authSession, sessionId]);

  const fetchChatSession = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v2/chat/session/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${authSession?.user?.email}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Convert backend data to expected format
        const chatSession: ChatSession = {
          id: data.id,
          raceId: data.race_id,
          raceTitle: `${data.venue} ${data.race_number}R`,
          createdAt: data.created_at,
          updatedAt: data.last_accessed_at,
          summary: data.race_name,
          messages: data.messages || []
        };
        
        const raceDetail: BoatRaceDetail = {
          id: data.race_id,
          date: data.race_date,
          venue: data.venue,
          day: data.race_number,
          title: data.race_name,
          grade: '一般' as const,
          weather: data.race_snapshot?.weather || '晴れ',
          windSpeed: data.race_snapshot?.wind_speed || 0,
          waveHeight: data.race_snapshot?.wave_height || 0,
          aiRank: 0,
          status: 'upcoming' as const,
          description: '',
          entries: [], // Will be empty for now
          notes: []
        };
        
        setSession(chatSession);
        setRace(raceDetail);
      } else {
        console.error('Failed to fetch chat session');
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error fetching chat session:', error);
      router.push('/chat');
    } finally {
      setLoading(false);
    }
  };

  const handleMessagesUpdate = useCallback(
    (messages: ChatSession['messages']) => {
      if (!session) return;
      const updated: ChatSession = {
        ...session,
        messages,
        updatedAt: new Date().toISOString(),
      };
      setSession(updated);
      // Backend will handle message persistence
    },
    [session],
  );

  const handleSettingsComplete = async (settingsData: IMLogicSettingsData) => {
    setSettings(settingsData);
    setCurrentStep('chat');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--background)] text-sm text-[var(--muted)]">
        読み込み中...
      </div>
    );
  }

  if (!session || !race) {
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
    <div className="bg-[var(--background)] min-h-screen">
      {/* ナビゲーションバー */}
      <div className="sticky top-[64px] z-30 bg-[var(--surface)] backdrop-blur-lg shadow-lg border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentStep('settings')}
              disabled={currentStep === 'settings'}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                currentStep === 'settings'
                  ? 'bg-[var(--brand-primary)] text-white font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
              }`}
            >
              <span className="text-sm font-medium">1. 設定</span>
            </button>
            <span className="text-[var(--muted)]">→</span>
            <button
              onClick={() => settings && setCurrentStep('chat')}
              disabled={!settings}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                currentStep === 'chat'
                  ? 'bg-[var(--brand-primary)] text-white font-semibold'
                  : settings
                    ? 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                    : 'text-[#aab4c5] cursor-not-allowed'
              }`}
            >
              <span className="text-sm font-medium">2. 分析</span>
            </button>
          </div>
        </div>
      </div>

      {/* ステップ2: IMLogic設定 */}
      {currentStep === 'settings' && (
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] p-4 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">IMLogic設定</h2>
                <p className="text-[var(--muted)]">
                  12項目の重み付けと、艇・選手の評価比率をカスタマイズできます
                </p>
              </div>
            </div>
            
            <IMLogicSettings onComplete={handleSettingsComplete} />
          </div>
        </div>
      )}

      {/* ステップ3: チャット分析 */}
      {currentStep === 'chat' && (
        <div className="w-full h-full">
          <div className="bg-[var(--background)] h-full">
            <div className="flex flex-col lg:flex-row h-full relative">
              {/* メインチャットエリア - 右マージンを追加 */}
              <div className="flex-1 flex flex-col h-full lg:mr-[450px] xl:mr-[550px] 2xl:mr-[650px]">
                
                {/* モバイル・タブレット用出走表アコーディオン */}
                <div ref={headerRef} className="lg:hidden fixed top-16 left-0 right-0 z-50">
                  {/* 開閉ボタン */}
                  <div className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <button
                      onClick={() => setShowMobileRaceTable(!showMobileRaceTable)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-primary)]" />
                        <span className="text-sm sm:text-base font-medium">
                          {race.venue} {race.day}R
                        </span>
                        <span className="text-xs text-[var(--muted)] ml-1">
                          ({race.entries.length}艇)
                        </span>
                      </div>
                      {showMobileRaceTable ? (
                        <ChevronUp className="w-4 h-4 text-[var(--brand-primary)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                      )}
                    </button>
                  </div>

                  {/* アコーディオンコンテンツ */}
                  {showMobileRaceTable && (
                    <div className="border-b border-[var(--border)] bg-[var(--surface)]" style={{ maxHeight: '40vh' }}>
                      <div className="h-full w-full overflow-y-auto" style={{ maxHeight: '40vh' }}>
                        <div className="w-full overflow-x-auto">
                          <div className="p-4">
                            {/* レース情報 */}
                            <div className="mb-4">
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-xs text-[var(--muted)]">天候</span>
                                  <p className="font-medium text-[var(--foreground)]">{race.weather}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-[var(--muted)]">風速</span>
                                  <p className="font-medium text-[var(--foreground)]">{race.windSpeed} m/s</p>
                                </div>
                                <div>
                                  <span className="text-xs text-[var(--muted)]">波高</span>
                                  <p className="font-medium text-[var(--foreground)]">{race.waveHeight} cm</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* 出走表 */}
                            <div className="bg-[var(--background)] rounded-lg overflow-hidden">
                              <table className="w-full text-sm min-w-[500px]">
                                <thead>
                                  <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                    <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">艇</th>
                                    <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">登録</th>
                                    <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">選手名</th>
                                    <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">支部</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {race.entries.map((entry) => {
                                    const laneColors = [
                                      'bg-white text-black',
                                      'bg-black text-white',
                                      'bg-red-600 text-white',
                                      'bg-blue-600 text-white',
                                      'bg-yellow-400 text-black',
                                      'bg-green-600 text-white',
                                    ];
                                    const color = laneColors[entry.lane - 1] || 'bg-gray-500 text-white';
                                    
                                    return (
                                      <tr
                                        key={entry.registerNumber}
                                        className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                                      >
                                        <td className="py-2 px-2">
                                          <span className={`inline-block w-6 h-6 text-xs font-bold text-center leading-6 rounded ${color}`}>
                                            {entry.lane}
                                          </span>
                                        </td>
                                        <td className="py-2 px-2 text-[var(--foreground)] text-xs">{entry.registerNumber}</td>
                                        <td className="py-2 px-2 text-[var(--foreground)] font-medium">{entry.racerName}</td>
                                        <td className="py-2 px-2 text-[var(--muted)] text-xs">{entry.branch}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-[calc(100vh-180px)]">
                  <ChatInterface
                    sessionId={sessionId}
                    race={race}
                    settings={settings}
                    initialMessages={session.messages}
                    onMessagesUpdate={handleMessagesUpdate}
                  />
                </div>
              </div>

              {/* 右サイド: 出走表（デスクトップのみ） - 固定配置 */}
              <div className="hidden lg:block lg:w-[450px] xl:w-[550px] 2xl:w-[650px] lg:fixed lg:right-0 lg:top-[128px] lg:h-[calc(100vh-128px)] border-l border-[var(--border)] bg-[var(--surface)]">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[var(--brand-primary)]/10 rounded-lg">
                        <Award className="w-6 h-6 text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {race.venue} {race.day}R
                        </div>
                        <div className="text-sm text-[var(--muted)]">{race.title}</div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {race.entries.length}艇立て
                    </div>
                  </div>
                </div>
                
                <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
                  {/* レース情報 */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-[var(--muted)]">天候</span>
                        <p className="font-medium text-[var(--foreground)]">{race.weather}</p>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted)]">風速</span>
                        <p className="font-medium text-[var(--foreground)]">{race.windSpeed} m/s</p>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted)]">波高</span>
                        <p className="font-medium text-[var(--foreground)]">{race.waveHeight} cm</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 出走表 */}
                  <div className="bg-[var(--background)] rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                          <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">艇</th>
                          <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">登録</th>
                          <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">選手名</th>
                          <th className="text-left py-2 px-2 text-xs text-[var(--muted)]">支部</th>
                        </tr>
                      </thead>
                      <tbody>
                        {race.entries.map((entry) => {
                          const laneColors = [
                            'bg-white text-black',
                            'bg-black text-white',
                            'bg-red-600 text-white',
                            'bg-blue-600 text-white',
                            'bg-yellow-400 text-black',
                            'bg-green-600 text-white',
                          ];
                          const color = laneColors[entry.lane - 1] || 'bg-gray-500 text-white';
                          
                          return (
                            <tr
                              key={entry.registerNumber}
                              className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                            >
                              <td className="py-2 px-2">
                                <span className={`inline-block w-6 h-6 text-xs font-bold text-center leading-6 rounded ${color}`}>
                                  {entry.lane}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-[var(--foreground)] text-xs">{entry.registerNumber}</td>
                              <td className="py-2 px-2 text-[var(--foreground)] font-medium">{entry.racerName}</td>
                              <td className="py-2 px-2 text-[var(--muted)] text-xs">{entry.branch}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
