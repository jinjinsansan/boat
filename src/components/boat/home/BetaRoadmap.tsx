const milestones = [
  {
    quarter: "2025 Q1",
    heading: "クローズドβ",
    summary: "競艇版 UI とチャット連携を先行ユーザーへ提供。精度検証のためのフィードバックループを構築。",
  },
  {
    quarter: "2025 Q2",
    heading: "自動配信の拡張",
    summary: "レース開始前のプッシュ通知、重要レースの解説カードをアプリ/LINE に同時展開。",
  },
  {
    quarter: "2025 Q3",
    heading: "正式リリース",
    summary: "収益モデルとパートナーシップを公開し、MyLogic 連携や API 提供を開始。",
  },
];

export function BetaRoadmap() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#ffb347]">
            Release Plan
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-[#0b1533]">
            D-Logic Boat ロードマップ（モック）
          </h2>
          <p className="mt-3 text-sm text-[#4f5d7a]">
            競馬版で実績のある開発スタックを横展開し、段階的に機能を取り込む計画です。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {milestones.map((mile) => (
            <div
              key={mile.quarter}
              className="flex flex-col gap-3 rounded-[28px] border border-[#e5ecfb] bg-[#f9fbff] p-6 shadow-[0_18px_40px_rgba(11,21,51,0.08)]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0f62fe]">
                {mile.quarter}
              </span>
              <h3 className="text-lg font-semibold text-[#0b1533]">{mile.heading}</h3>
              <p className="text-sm leading-relaxed text-[#4f5d7a]">{mile.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
