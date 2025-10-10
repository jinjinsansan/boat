import Link from "next/link";

import { ChatSessionList } from "@/components/boat/ChatSessionList";
import { RaceOverviewGrid } from "@/components/boat/RaceOverviewGrid";
import { formatDate } from "@/lib/formatters";
import { getMockChatSessions } from "@/data/mock/chat";
import { getMockRaces } from "@/data/mock/races";

export default function HomePage() {
  const races = getMockRaces();
  const sessions = getMockChatSessions();
  const metrics = [
    {
      label: "登録レース",
      value: races.length.toString(),
      description: "モックデータ",
    },
    {
      label: "AI推奨舟券",
      value: "24件/日",
      description: "競艇向け実装予定",
    },
    {
      label: "分析エンジン",
      value: "9",
      description: "競馬版ロジック流用",
    },
    {
      label: "最新アップデート",
      value: formatDate("2025-10-10"),
      description: "モック更新日",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
      <section className="grid items-center gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-[var(--brand-secondary)]/15 px-4 py-1 text-sm font-semibold text-[var(--brand-secondary)]">
            BOAT AI PLATFORM
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] md:text-5xl">
            D-Logic Boat で競艇分析をスマートに
          </h1>
          <p className="text-lg text-[var(--muted)]">
            競馬版で培ったノウハウをそのままに、競艇レース向けのデータ分析体験をホワイトテーマで提供します。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/races"
              className="rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
            >
              レースを確認
            </Link>
            <Link
              href="/chat"
              className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:border-[var(--brand-primary)]"
            >
              AIチャットを見る
            </Link>
          </div>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">
              PLATFORM SNAPSHOT
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-[var(--border)] bg-white px-6 py-5"
                >
                  <p className="text-xs font-medium text-[var(--muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {item.value}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              注目レース
            </h2>
            <p className="text-sm text-[var(--muted)]">
              競艇の主要レース情報を、競馬版コンポーネントを元にホワイトテーマで再構成しています。
            </p>
          </div>
          <Link
            href="/races"
            className="text-sm font-semibold text-[var(--brand-primary)]"
          >
            すべて見る →
          </Link>
        </div>
        <RaceOverviewGrid races={races} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              AIチャット最新ログ
            </h2>
            <p className="text-sm text-[var(--muted)]">
              レースごとの AI 分析チャットをモックデータで表示しています。
            </p>
          </div>
          <Link
            href="/chat"
            className="text-sm font-semibold text-[var(--brand-primary)]"
          >
            チャットを開く →
          </Link>
        </div>
        <ChatSessionList sessions={sessions.slice(0, 4)} />
      </section>
    </div>
  );
}
