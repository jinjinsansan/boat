import type { ChatMessage } from "@/types/chat";

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
});

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white px-5 py-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
            <span>{message.role === "assistant" ? "AI" : "ユーザー"}</span>
            <span>{timeFormatter.format(new Date(message.createdAt))}</span>
          </div>
          <p className="mt-2 text-sm text-[var(--foreground)]">{message.content}</p>
        </div>
      ))}
    </div>
  );
}
