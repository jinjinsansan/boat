const columnCategories = [
  {
    title: "SG特集",
    articles: [
      { title: "グランドチャンピオン 進入傾向レポート", date: "2025/10/10", views: "1,204" },
      { title: "オーシャンカップ 潮汐データ分析", date: "2025/10/09", views: "984" },
    ],
  },
  {
    title: "AI勝負レース",
    articles: [
      { title: "芦屋12R AIが推す本線と穴目", date: "2025/10/08", views: "832" },
      { title: "戸田9R 進入固定戦の組み立て", date: "2025/10/07", views: "768" },
    ],
  },
];

export function ColumnsPreview() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <div className="space-y-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#3dd6d0]">
            Columns & Insights
          </span>
          <h2 className="text-3xl font-semibold text-[#0b1533]">
            競艇向けの特集・AI分析レポート（モック）
          </h2>
          <p className="text-sm text-[#4f5d7a]">
            競馬版で提供中のコラムセクションと同形式で、競艇版の特集記事を公開予定です。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {columnCategories.map((category) => (
            <div key={category.title} className="rounded-[28px] border border-[#e5ecfb] bg-[#f9fbff] p-6 shadow-[0_20px_50px_rgba(11,21,51,0.05)]">
              <h3 className="text-lg font-semibold text-[#0b1533]">{category.title}</h3>
              <div className="mt-4 overflow-hidden rounded-[20px] border border-white/80 bg-white">
                <table className="w-full text-left text-sm text-[#4f5d7a]">
                  <thead className="bg-[#eef3ff] text-xs uppercase tracking-wide text-[#6c7a99]">
                    <tr>
                      <th className="px-4 py-3">No.</th>
                      <th className="px-4 py-3">タイトル</th>
                      <th className="px-4 py-3">閲覧数</th>
                      <th className="px-4 py-3">公開日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.articles.map((article, index) => (
                      <tr key={article.title} className="border-t border-[#eef3ff]">
                        <td className="px-4 py-3 text-xs text-[#6c7a99]">{index + 1}</td>
                        <td className="px-4 py-3 text-[#0b1533]">{article.title}</td>
                        <td className="px-4 py-3">👁 {article.views}</td>
                        <td className="px-4 py-3">{article.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
