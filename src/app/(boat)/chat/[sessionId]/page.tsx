import Link from "next/link";
import { notFound } from "next/navigation";

import { ChatMessageList } from "@/components/boat/ChatMessageList";
import { getMockChatMessages, getMockChatSessions } from "@/data/mock/chat";
import { getMockRaceById } from "@/data/mock/races";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const sessions = getMockChatSessions();
  const session = sessions.find((item) => item.id === sessionId);

  if (!session) {
    notFound();
  }

  const race = getMockRaceById(session.raceId);
  const messages = getMockChatMessages(session.id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-[var(--brand-secondary)]">
          CHAT SESSION MOCK
        </p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          {session.title}
        </h1>
        <p className="text-sm text-[var(--muted)]">{session.highlight}</p>
        {race && (
          <Link
            href={`/races/${race.id}`}
            className="text-sm font-semibold text-[var(--brand-primary)]"
          >
            対象レースを見る →
          </Link>
        )}
      </header>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <ChatMessageList messages={messages} />
      </section>
    </div>
  );
}
