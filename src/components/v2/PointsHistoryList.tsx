"use client"

import { useCallback, useEffect, useState } from "react"
import { Clock, Coins, Loader2, TrendingDown, TrendingUp } from "lucide-react"

import { v2ApiClient } from "@/lib/v2/apiClient"
import { cacheManager } from "@/utils/cacheUtils"

interface PointTransaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  balance_after: number
  created_at: string
}

export function PointsHistoryList() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const limit = 20

  const fetchAndUpdateTransactions = useCallback(
    async (cacheKey: string, updateLoading: boolean, currentPage: number) => {
      try {
        if (updateLoading) setLoading(true)

        const response = await v2ApiClient.getTransactions(limit, currentPage * limit)
        const fetchedTransactions = response.transactions as PointTransaction[]

        if (currentPage === 0) {
          setTransactions(fetchedTransactions)
          cacheManager.set(cacheKey, { transactions: fetchedTransactions }, 3 * 60 * 1000)
        } else {
          setTransactions((prev) => [...prev, ...fetchedTransactions])
        }

        setHasMore(fetchedTransactions.length === limit)
        setIsInitialLoad(false)
      } finally {
        if (updateLoading) setLoading(false)
      }
    },
    [limit],
  )

  const loadTransactions = useCallback(
    async (currentPage: number) => {
      try {
        const cacheKey = `points_transactions_${currentPage}`

        if (isInitialLoad && currentPage === 0) {
          const { data: cachedData, isStale } = cacheManager.isStale<{ transactions: PointTransaction[] }>(cacheKey)
          if (cachedData) {
            setTransactions(cachedData.transactions)
            setHasMore(cachedData.transactions.length === limit)
            setLoading(false)
            setIsInitialLoad(false)

            if (isStale) {
              void fetchAndUpdateTransactions(cacheKey, false, currentPage)
            }
            return
          }
        }

        setLoading(true)
        setError(null)
        await fetchAndUpdateTransactions(cacheKey, true, currentPage)
      } catch (err) {
        console.error("[Boat] Failed to load point transactions:", err)
        setError("ポイント履歴の読み込みに失敗しました")
        setLoading(false)
      }
    },
    [fetchAndUpdateTransactions, isInitialLoad, limit],
  )

  useEffect(() => {
    void loadTransactions(page)
  }, [loadTransactions, page])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (amount: number) => {
    if (amount > 0) {
      return <TrendingUp className="h-5 w-5 text-emerald-500" />
    }
    return <TrendingDown className="h-5 w-5 text-rose-500" />
  }

  const getTransactionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      google_auth: "Google認証ボーナス",
      line_connect: "LINE連携ボーナス",
      referral: "友達紹介ボーナス",
      daily_login: "デイリーログイン",
      chat_usage: "チャット使用",
      column_view: "コラム閲覧",
      purchase: "ポイント購入",
      admin_grant: "管理者付与",
      initial_grant: "初回ボーナス",
      test_grant: "テスト付与",
      admin_reset: "管理者リセット",
    }
    return typeMap[type] || type
  }

  if (loading && page === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0f62fe]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadTransactions(page)}
          className="rounded-full bg-[#0f62fe] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0946c3]"
        >
          再読み込み
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <Coins className="mx-auto h-12 w-12 text-[#dfe7fb]" />
        <p className="mt-4 text-sm text-[#4f5d7a]">ポイント履歴がありません</p>
        <p className="mt-2 text-xs text-[#8291b3]">ポイントの獲得・使用履歴がここに表示されます。</p>
      </div>
    )
  }

  const totalEarned = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const currentBalance = transactions[0]?.balance_after || 0

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] p-4">
        <div className="grid gap-4 text-center sm:grid-cols-3">
          <div>
            <p className="text-xs text-[#4f5d7a]">獲得合計</p>
            <p className="mt-1 text-lg font-bold text-emerald-600">+{totalEarned.toLocaleString()} P</p>
          </div>
          <div>
            <p className="text-xs text-[#4f5d7a]">使用合計</p>
            <p className="mt-1 text-lg font-bold text-rose-500">-{totalSpent.toLocaleString()} P</p>
          </div>
          <div>
            <p className="text-xs text-[#4f5d7a]">現在の残高</p>
            <p className="mt-1 text-lg font-bold text-[#0f62fe]">{currentBalance.toLocaleString()} P</p>
          </div>
        </div>
      </div>

      {transactions.map((transaction) => (
        <div key={transaction.id} className="rounded-2xl border border-[#dfe7fb] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getTransactionIcon(transaction.amount)}
              <div>
                <h4 className="text-sm font-semibold text-[#102a43]">
                  {getTransactionTypeLabel(transaction.transaction_type)}
                </h4>
                <p className="mt-1 text-xs text-[#4f5d7a]">{transaction.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-[#8291b3]">
                  <Clock className="h-3 w-3" />
                  {formatDate(transaction.created_at)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${transaction.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount} P
              </p>
              <p className="mt-1 text-xs text-[#8291b3]">残高: {transaction.balance_after} P</p>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#dfe7fb] bg-white py-3 text-sm font-semibold text-[#0f62fe] transition-colors hover:bg-[#f5f8ff] disabled:cursor-not-allowed disabled:bg-[#f5f8ff]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> 読み込み中...
            </>
          ) : (
            "さらに読み込む"
          )}
        </button>
      )}
    </div>
  )
}
