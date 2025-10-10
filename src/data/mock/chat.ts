import type {
  ChatMessageMock,
  ChatSessionSummary,
} from "@/types/race";

export const mockChatSessions: ChatSessionSummary[] = [
  {
    id: "session-01",
    raceId: "naruto-20251010-g1",
    title: "鳴門12R 優勝戦 AI 分析",
    updatedAt: "2025-10-10T13:20:00+09:00",
    highlight: "峰竜太選手のイン戦優位。2-1-3 厚い構成",
  },
  {
    id: "session-02",
    raceId: "toda-20251010-g2",
    title: "戸田9R 準優勝戦 展開シミュレーション",
    updatedAt: "2025-10-10T12:45:00+09:00",
    highlight: "センター勢のカド捲り期待。4-5 流し",
  },
  {
    id: "session-03",
    raceId: "tamagawa-20251010-sg",
    title: "多摩川5R SG 予選 AI 作戦会議",
    updatedAt: "2025-10-10T12:05:00+09:00",
    highlight: "潮が引き始め、ダッシュ勢優位の想定",
  },
];

const aiMessages = [
  "スタート展示のタイミングから 1コース有利だが、風向きが追い風に変わる可能性あり。",
  "進入固定。ダッシュ勢の伸びが良く、2マークで差し返しの展開も視野に。",
  "期待値計算では 1-2-3 が本線、穴目は 4-1-5 の捲り差しパターン。",
];

export function getMockChatSessions(): ChatSessionSummary[] {
  return mockChatSessions;
}

export function getMockChatMessages(sessionId: string): ChatMessageMock[] {
  return aiMessages.map((content, index) => ({
    id: `${sessionId}-msg-${index + 1}`,
    author: "ai",
    content,
    createdAt: new Date(Date.now() - index * 5 * 60 * 1000).toISOString(),
  }));
}
