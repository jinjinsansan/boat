import { ChatSessionList } from "@/components/boat/ChatSessionList";
import { getMockChatSessions } from "@/data/mock/chat";

export default function ChatLobbyPage() {
  const sessions = getMockChatSessions();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-[var(--brand-secondary)]">
          CHAT DASHBOARD
        </p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">AIチャット一覧（モック）</h1>
        <p className="text-sm text-[var(--muted)]">
          競馬版のチャット体験を競艇向けに流用するためのモック画面です。
        </p>
      </header>

      <ChatSessionList sessions={sessions} />
    </div>
  );
}
