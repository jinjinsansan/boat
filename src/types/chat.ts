export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatPreset {
  id: string;
  label: string;
  description?: string;
  message: string;
  category: "prediction" | "trend" | "knowledge" | "starter";
}

export interface ChatSession {
  id: string;
  raceId: string;
  raceTitle: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  messages: ChatMessage[];
}
