// チャット関連の型定義（競艇版）

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  raceId: string;
  raceTitle: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  messages: ChatMessage[];
}

export interface CreateChatSessionRequest {
  raceId: string;
  raceTitle: string;
  raceDate?: string;
  venue?: string;
  grade?: string;
}

export interface CreateChatSessionResponse {
  chat_id: string;
  session_id: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
}
