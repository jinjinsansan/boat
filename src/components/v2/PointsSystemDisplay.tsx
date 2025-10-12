"use client"

import { Calendar, Gift, Star, Users } from "lucide-react"

export function PointsSystemDisplay() {
  return (
    <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#102a43]">
        <Star className="h-5 w-5 text-[#0f62fe]" />
        <h3 className="text-lg font-semibold">ポイント獲得方法</h3>
      </div>

      <div className="mt-4 space-y-4 text-sm text-[#4f5d7a]">
        <section className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#102a43]">
            <Gift className="h-4 w-4 text-[#0f62fe]" />初回ボーナス
          </h4>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Google認証: <span className="font-semibold text-[#0f62fe]">2ポイント</span></li>
            <li>• LINE連携: <span className="font-semibold text-[#0f62fe]">12ポイント</span></li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[#dfe7fb] bg-white px-4 py-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#102a43]">
            <Calendar className="h-4 w-4 text-emerald-500" />毎日獲得
          </h4>
          <p className="mt-2 text-xs">• ログインボーナス: <span className="font-semibold text-emerald-600">2ポイント/日</span></p>
        </section>

        <section className="rounded-2xl border border-[#dfe7fb] bg-white px-4 py-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#102a43]">
            <Users className="h-4 w-4 text-[#c026d3]" />友達紹介ボーナス
          </h4>
          <div className="mt-2 text-xs">
            <p className="text-[#4f5d7a]">紹介された方</p>
            <p>• <span className="font-semibold text-[#c026d3]">10ポイント</span>獲得</p>
            <p className="mt-2 text-[#4f5d7a]">紹介した方（累積ボーナス）</p>
            <ul className="mt-1 space-y-1">
              <li>• 1人目: <span className="font-semibold text-[#c026d3]">30ポイント</span></li>
              <li>• 2人目: <span className="font-semibold text-[#c026d3]">40ポイント</span></li>
              <li>• 3人目: <span className="font-semibold text-[#c026d3]">50ポイント</span></li>
              <li>• 4人目: <span className="font-semibold text-[#c026d3]">60ポイント</span></li>
              <li>• 5人目: <span className="font-semibold text-[#c026d3]">100ポイント</span></li>
            </ul>
          </div>
        </section>

        <p className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-xs text-[#4f5d7a]">
          ※ チャット作成時の消費ポイントは現在 <span className="font-semibold text-rose-500">0ポイント</span> です。
        </p>
      </div>
    </div>
  )
}
