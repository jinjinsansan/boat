import type { ChatSessionSummary } from "@/types/race";
import { ChatSessionCard } from "./ChatSessionCard";

interface ChatSessionListProps {
  sessions: ChatSessionSummary[];
}

export function ChatSessionList({ sessions }: ChatSessionListProps) {
  if (!sessions.length) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
        現在表示できるチャットがありません。
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sessions.map((session) => (
        <ChatSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
