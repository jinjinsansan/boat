const comparisonRows = [
  {
    title: "従来のボート予想",
    points: [
      "AIと謳いながら実際は人の予想を羅列",
      "直近データのみで分析し長期傾向を反映できない",
      "レース後に記事が削除され検証ができない",
    ],
    accent: "bg-[#fbeaea] text-[#c53d3d]",
  },
  {
    title: "D-Logic Boat",
    points: [
      "公式LZHデータを解析しAIが自動評価",
      "進入・モーター・潮汐まで多変量でスコア化",
      "全レースの推奨舟券と精度を履歴として保存",
    ],
    accent: "bg-[#ecf4ff] text-[#0f62fe]",
  },
];

export function FeatureComparison() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="space-y-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#3dd6d0]">
            Why D-Logic Boat
          </span>
          <h2 className="text-3xl font-semibold text-[#0b1533]">
            予想家記事に頼らない、本物のAI予想を提供
          </h2>
          <p className="text-sm text-[#4f5d7a]">
            競馬版で証明されたアルゴリズムを競艇に最適化。人手に依存しない完全自動の分析基盤を構築します。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {comparisonRows.map((row) => (
            <div key={row.title} className={`rounded-[28px] border border-[#e5ecfb] p-6 shadow-[0_20px_60px_rgba(11,21,51,0.06)] ${row.accent}`}>
              <h3 className="text-lg font-semibold">{row.title}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {row.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden>•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
