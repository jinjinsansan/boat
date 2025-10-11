import Link from "next/link";
import { formatTimeAgo } from "@/lib/formatters";
import type { ChatSession } from "@/types/chat";

interface ChatSessionCardProps {
  session: ChatSession;
}

export function ChatSessionCard({ session }: ChatSessionCardProps) {
  return (
    <Link
      href={`/chat/${session.id}`}
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {session.raceTitle}
        </h2>
        <span className="text-xs font-semibold text-[var(--muted)]">
          {formatTimeAgo(session.updatedAt)}
        </span>
      </div>
      <p className="text-sm text-[var(--muted)]">{session.summary}</p>
      <div className="text-sm font-semibold text-[var(--brand-primary)]">
        詳細を見る →
      </div>
    </Link>
  );
}
