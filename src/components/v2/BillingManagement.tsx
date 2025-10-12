"use client"

import { AlertCircle, CheckCircle, Clock, CreditCard, Package } from "lucide-react"

export function BillingManagement() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#102a43]">現在のプラン</h3>
            <div className="mt-3 flex items-center gap-2 text-[#0f62fe]">
              <Package className="h-5 w-5" />
              <span className="text-xl font-bold">無料プラン</span>
            </div>
            <p className="mt-2 text-xs text-[#4f5d7a]">
              LINE連携や友達紹介でポイントを獲得できます。
            </p>
          </div>
          <CheckCircle className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[#102a43]">
          <CreditCard className="h-5 w-5 text-[#0f62fe]" />ポイント購入
        </h3>
        <div className="mt-4 rounded-2xl border border-[#ffe8b2] bg-[#fff7e0] p-4 text-sm text-[#8f6a04]">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">準備中</p>
              <p className="mt-1 text-xs text-[#8f6a04]">
                ポイント購入機能は現在開発中です。公開までもうしばらくお待ちください。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[#102a43]">
          <Clock className="h-5 w-5 text-[#0f62fe]" />購入履歴
        </h3>
        <div className="mt-4 rounded-2xl border border-[#eff3ff] bg-[#f5f8ff] p-6 text-center text-sm text-[#4f5d7a]">
          購入履歴はありません
        </div>
      </div>
    </div>
  )
}
