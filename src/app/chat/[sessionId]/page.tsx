import Link from "next/link";
import { notFound } from "next/navigation";

import { ChatInterface } from "@/components/boat/chat/ChatInterface";
import { getMockChatSessionById } from "@/data/mock/chat";
import { getMockRaceById } from "@/data/mock/races";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = getMockChatSessionById(sessionId);
  if (!session) {
    notFound();
  }

  const race = getMockRaceById(session.raceId);
  if (!race) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-[var(--brand-secondary)]">CHAT SESSION</p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{session.raceTitle}</h1>
        <p className="text-sm text-[var(--muted)]">{session.summary}</p>
        <Link
          href={`/races/${race.id}`}
          className="text-sm font-semibold text-[var(--brand-primary)]"
        >
          対象レースを見る →
        </Link>
      </header>

      <ChatInterface race={race} initialMessages={session.messages} />
    </div>
  );
}
