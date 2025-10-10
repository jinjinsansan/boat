import Link from "next/link";

const heroMetrics = [
  { label: "応答時間", value: "約2秒", color: "bg-emerald-400" },
  { label: "チャット形式", value: "レース別対話", color: "bg-sky-400" },
  { label: "対象", value: "全国競艇場対応予定", color: "bg-[#ffb347]" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0b1533] text-white">
      <div className="absolute inset-0">
        <div className="absolute -left-36 top-16 h-72 w-72 rounded-full bg-[#0f62fe]/20 blur-[160px]" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#3dd6d0]/20 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1430] via-[#07192d] to-[#0a1224]/95" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-20 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl space-y-6 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm uppercase tracking-[0.3em] text-[#3dd6d0]">
            Next Gen Boat Intelligence
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            競艇AI <span className="text-[#0f62fe] drop-shadow-[0_0_25px_rgba(15,98,254,0.45)]">D-Logic Boat</span>
            <span className="block text-3xl font-semibold text-white/85 md:text-4xl">
              レース分析をあなたの手に
            </span>
          </h1>
          <p className="text-base text-white/75 md:text-lg">
            競馬版で培った10基のAIエンジンを競艇向けに最適化。公式データを解析し、進入・モーター・潮汐まで一括分析する次世代の競艇予想プラットフォームです。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/races"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1533] shadow-[0_10px_30px_rgba(15,98,254,0.35)] transition-transform hover:-translate-y-0.5"
            >
              レース一覧を開く
            </Link>
            <Link
              href="/chat"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              分析チャットを見る
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/60 md:justify-start">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${metric.color}`} />
                <span className="font-medium text-white/70">{metric.label}</span>
                <span className="text-white/50">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex w-full max-w-xl flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
            Demo Preview
          </p>
          <div className="space-y-3 rounded-[24px] bg-white/10 p-6">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>AIチャット</span>
              <span>艇番別展開シミュレーション</span>
            </div>
            <div className="rounded-2xl bg-white/90 p-5 text-[#0b1533] shadow-[0_15px_40px_rgba(11,21,51,0.3)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f62fe]/10 text-[#0f62fe] font-bold">
                  AI
                </span>
                <div>
                  <p className="text-sm font-semibold">鳴門12R 優勝戦</p>
                  <p className="text-xs text-[#4f5d7a]">スタート展示: 進入想定 1-2-3/4-5-6</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• イン1峰竜太の足色良好。0.12前後の全速想定。</li>
                <li>• ダッシュ勢は伸び型。4コース白井のまくり差しが本線。</li>
                <li>• 買い目: 1=4-2, 4-1=2, 押さえで1-2-3。</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
              <p>まもなく LZH データ連携を開始し、AI 予測を自動生成します。</p>
              <p className="mt-2 text-xs text-white/50">競馬版 D-Logic のアルゴリズムをベースに、競艇特有の指標を追加中。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
