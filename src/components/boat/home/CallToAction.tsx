import Link from "next/link";

export function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-[#0b1533] py-16 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f62fe]/90 to-[#3dd6d0]/80" />
        <div className="absolute -right-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/20 blur-[120px]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
          Get Ready
        </span>
        <h2 className="text-3xl font-semibold sm:text-4xl">
          競艇版 D-Logic のクローズドテスト参加者を募集中
        </h2>
        <p className="max-w-2xl text-sm text-white/80 sm:text-base">
          UI の移植が完了したら、競馬版で運用中の AI エンジンを順次競艇データに適用し、モーター・潮汐・進入指数を組み合わせた推奨舟券を提供します。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/chat"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1533] shadow-[0_10px_30px_rgba(11,21,51,0.4)] transition-transform hover:-translate-y-0.5"
          >
            テスト版チャットを見る
          </Link>
          <Link
            href="/races"
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            レースダッシュボードへ
          </Link>
        </div>
      </div>
    </section>
  );
}
