import Link from "next/link";

import { ChatSessionList } from "@/components/boat/ChatSessionList";
import { RaceOverviewGrid } from "@/components/boat/RaceOverviewGrid";
import { getMockChatSessions } from "@/data/mock/chat";
import { getMockRaces } from "@/data/mock/races";
import { HeroSection } from "@/components/boat/home/HeroSection";
import { FeatureComparison } from "@/components/boat/home/FeatureComparison";
import { ColumnsPreview } from "@/components/boat/home/ColumnsPreview";
import { RealtimeStatsMock } from "@/components/boat/home/RealtimeStatsMock";
import { CallToAction } from "@/components/boat/home/CallToAction";

export default function HomePage() {
  const races = getMockRaces();
  const sessions = getMockChatSessions();
  // メトリクスはヒーローセクション内でモック表示中。必要に応じて値を更新。

  return (
    <>
      <HeroSection />

      <section className="bg-white py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#3dd6d0]">
                Featured Races
              </span>
              <h2 className="text-3xl font-semibold text-[#0b1533]">注目レース（モック）</h2>
              <p className="text-sm text-[#4f5d7a]">
                競馬版のレースダッシュボードを参考に、競艇向けカード UI を配置しています。正式リリース時にはリアルデータが流入します。
              </p>
            </div>
            <Link
              href="/races"
              className="text-sm font-semibold text-[#0f62fe]"
            >
              すべて見る →
            </Link>
          </div>
          <RaceOverviewGrid races={races} />
        </div>
      </section>

      <FeatureComparison />

      <section className="bg-white py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#3dd6d0]">
                AI Chat Logs
              </span>
              <h2 className="text-3xl font-semibold text-[#0b1533]">AIチャット最新ログ（モック）</h2>
              <p className="text-sm text-[#4f5d7a]">
                競馬版のチャット履歴 UI と同じ形式で、競艇レース向けの分析ログを表示する準備が整っています。
              </p>
            </div>
            <Link
              href="/chat"
              className="text-sm font-semibold text-[#0f62fe]"
            >
              チャットを開く →
            </Link>
          </div>
          <ChatSessionList sessions={sessions.slice(0, 4)} />
        </div>
      </section>

      <ColumnsPreview />

      <RealtimeStatsMock />

      <CallToAction />
    </>
  );
}
