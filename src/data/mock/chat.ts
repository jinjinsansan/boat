import { nanoid } from "nanoid/non-secure";

import type { ChatMessage, ChatPreset, ChatSession } from "@/types/chat";

export const mockChatPresets: ChatPreset[] = [
  {
    id: "preset-all",
    label: "全艇の展開を分析",
    description: "参加選手のスタート力・モーター評価を踏まえて展開予測",
    message: "このレースを展開シミュレーションして",
    category: "prediction",
  },
  {
    id: "preset-inside",
    label: "イン勢の信頼度",
    description: "1・2コースのスタート傾向と信頼度を教えて",
    message: "イン勢の信頼度とスタート傾向を教えて",
    category: "trend",
  },
  {
    id: "preset-dash",
    label: "ダッシュ勢の一発",
    description: "4・5コースの一発可能性と買い目候補",
    message: "ダッシュ勢の一発があるか分析して",
    category: "prediction",
  },
  {
    id: "preset-knowledge",
    label: "選手プロフィール",
    description: "登録番号ごとのプロフィールと最近の成績",
    message: "参加選手のプロフィールと強みをまとめて",
    category: "knowledge",
  },
];

const baseAssistantMessages = [
  "スタート展示の結果から内枠の加速が優勢。機力差は僅差だが 1、2 号艇が一歩リード。",
  "中盤の潮回りでダッシュ勢の伸びが改善。4 号艇の仕掛けに乗じて 5 号艇が連動するシナリオも想定。",
  "期待値計算では 1-2-3 が本線。穴目は 1-4-5 と 2-1-5 のスジが浮上。",
];

const buildMessages = (sessionId: string): ChatMessage[] =>
  baseAssistantMessages.map((content, index) => ({
    id: `${sessionId}-msg-${index + 1}`,
    role: "assistant" as const,
    content,
    createdAt: new Date(Date.now() - index * 7 * 60 * 1000).toISOString(),
  }));

export const mockChatSessions: ChatSession[] = [
  {
    id: "session-boat-01",
    raceId: "naruto-20251010-g1",
    raceTitle: "鳴門12R 優勝戦",
    createdAt: "2025-10-10T13:00:00+09:00",
    updatedAt: "2025-10-10T13:20:00+09:00",
    summary: "峰竜太選手のイン戦を軸に、センター勢の仕掛けを加味した展開を分析したチャットです。",
    messages: buildMessages("session-boat-01"),
  },
  {
    id: "session-boat-02",
    raceId: "toda-20251010-g2",
    raceTitle: "戸田9R 準優勝戦",
    createdAt: "2025-10-10T12:20:00+09:00",
    updatedAt: "2025-10-10T12:45:00+09:00",
    summary: "センター勢のカド捲りを想定した進入と買い目候補を検討中のセッション。",
    messages: buildMessages("session-boat-02"),
  },
  {
    id: "session-boat-03",
    raceId: "tamagawa-20251010-sg",
    raceTitle: "多摩川5R SG 予選",
    createdAt: "2025-10-10T11:40:00+09:00",
    updatedAt: "2025-10-10T12:05:00+09:00",
    summary: "潮位変化に合わせた仕掛けとモーター診断をまとめたファイル。",
    messages: buildMessages("session-boat-03"),
  },
];

export function getMockChatSessions(): ChatSession[] {
  return mockChatSessions;
}

export function getMockChatSessionById(id: string): ChatSession | undefined {
  return mockChatSessions.find((session) => session.id === id);
}

export function createMockUserMessage(content: string): ChatMessage {
  return {
    id: `user-${nanoid(6)}`,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createMockAssistantMessage(prompt: string): ChatMessage {
  const template = baseAssistantMessages[Math.floor(Math.random() * baseAssistantMessages.length)];
  return {
    id: `asst-${nanoid(6)}`,
    role: "assistant",
    content: `${template}\n\n（リクエスト: ${prompt}）`,
    createdAt: new Date().toISOString(),
  };
}
