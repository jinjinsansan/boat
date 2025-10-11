const pillars = [
  {
    title: "公式データ×AI検証",
    description:
      "LZH 公開データを日次で取り込み、競馬版で鍛えた 10 基のエンジンで艇番スコアを生成。人力の予想記事に頼らない設計です。",
    accent: "from-[#0f62fe]/10 via-white to-white",
  },
  {
    title: "即時の展開シミュレーション",
    description:
      "スタート展示や潮汐、モーター指数を同時に評価し、進入隊形ごとの展開パターンを提示。チャット体験に組み込みます。",
    accent: "from-[#3dd6d0]/10 via-white to-white",
  },
  {
    title: "検証可能な履歴管理",
    description:
      "過去レースの推奨舟券と命中率をアーカイブし、学習ログとして公開予定。ユーザー自身で検証できる透明性を重視します。",
    accent: "from-[#ffb347]/10 via-white to-white",
  },
];

export function ValuePillars() {
  return (
    <section id="value" className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#3dd6d0]">
            Product Value
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-[#0b1533]">
            競艇版 D-Logic が解決する課題
          </h2>
          <p className="mt-3 text-sm text-[#4f5d7a]">
            予想家依存からの脱却、データを基点にした一貫した分析サイクルを実現します。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className={`rounded-[28px] border border-[#e5ecfb] bg-gradient-to-br ${pillar.accent} p-6 shadow-[0_18px_40px_rgba(11,21,51,0.08)]`}
            >
              <h3 className="text-lg font-semibold text-[#0b1533]">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4f5d7a]">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
