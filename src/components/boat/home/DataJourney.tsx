const steps = [
  {
    stage: "1",
    title: "データ収集",
    detail: "競艇オフィシャルサイトの LZH データを定期クロールし、スタート展示・モーター・オッズを正規化。",
  },
  {
    stage: "2",
    title: "AIスコアリング",
    detail: "競馬版で実証済みの 10 エンジンを艇番向けに調整。進入パターン別のシミュレーションを生成。",
  },
  {
    stage: "3",
    title: "チャネル配信",
    detail: "Web、LINE、アプリ（TWA）に同時展開。チャット UI から即時に予測値を取得。",
  },
];

export function DataJourney() {
  return (
    <section id="journey" className="bg-[#f4f6fb] py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#0f62fe]">
            Data Pipeline
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-[#0b1533]">
            データが AI 推奨になるまでの流れ
          </h2>
          <p className="mt-3 text-sm text-[#4f5d7a]">
            競馬版で運用中のパイプラインを競艇向けにリファインし、再現性のある配信フローを構築します。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.stage}
              className="relative rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(11,21,51,0.1)]"
            >
              <span className="absolute -top-3 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0f62fe] text-sm font-semibold text-white">
                {step.stage}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-[#0b1533]">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4f5d7a]">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
