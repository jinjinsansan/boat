const stats = [
  { label: "想定ユーザー", value: "8,950", subtitle: "競馬版実績ベース" },
  { label: "想定チャット数", value: "98,504", subtitle: "累計分析セッション" },
  { label: "AIエンジン", value: "10", subtitle: "競馬版を継承" },
  { label: "対応予定会場", value: "24", subtitle: "全国主要ボートレース場" },
];

const activities = [
  "鳴門12R の分析テンプレート生成",
  "多摩川5R の潮汐データ反映",
  "戸田9R 展開シミュレーション更新",
  "芦屋11R AIスコア調整",
  "資格テスター向けベータ版配信",
];

export function RealtimeStatsMock() {
  return (
    <section className="bg-[#f4f6fb] py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#0f62fe]">Realtime Preview</span>
            <h2 className="text-3xl font-semibold text-[#0b1533]">競艇版リリースに向けた想定稼働メトリクス</h2>
            <p className="text-sm text-[#4f5d7a] max-w-2xl">
              競馬版 D-Logic で蓄積した利用状況をもとに、競艇ドメインでの稼働イメージを算出。正式リリース時にはリアルタイム統計を同じダッシュボードで提供します。
            </p>
          </div>
          <div className="rounded-[24px] border border-[#dde3f6] bg-white px-6 py-4 text-sm text-[#4f5d7a] shadow-[0_12px_45px_rgba(11,21,51,0.08)]">
            <p className="font-semibold text-[#0b1533]">システムステータス</p>
            <p className="mt-1 text-xs">競馬版 D-Logic の監視仕組みを流用。競艇環境でも同じ SLA を目指します。</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#15803d]">正常稼働想定</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-[#dde3f6] bg-white p-6 shadow-[0_10px_30px_rgba(11,21,51,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0f62fe]/70">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#0b1533]">{stat.value}</p>
                <p className="text-xs text-[#6c7a99]">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-[#dde3f6] bg-white p-6 shadow-[0_10px_30px_rgba(11,21,51,0.08)]">
              <h3 className="text-sm font-semibold text-[#0b1533]">最近のアクティビティ（想定）</h3>
              <ul className="mt-4 space-y-3 text-xs text-[#4f5d7a]">
                {activities.map((activity, idx) => (
                  <li key={activity} className="flex items-start gap-2">
                    <span className="mt-1 text-[#0f62fe]/70">{idx + 1}.</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
