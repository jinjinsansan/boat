"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Coins, TrendingDown, TrendingUp } from "lucide-react"

import { v2ApiClient } from "@/lib/v2/apiClient"
import { cacheManager } from "@/utils/cacheUtils"

interface PointsInfo {
  current_points: number
  total_earned: number
  total_spent: number
}

export function PointsDisplay() {
  const { data: session } = useSession()
  const [pointsInfo, setPointsInfo] = useState<PointsInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const lastFetchRef = useRef(0)

  const fetchPointsInfo = useCallback(
    async (updateLoading: boolean) => {
      try {
        if (updateLoading) setLoading(true)

        const timeoutMs = 8000
        const response = await Promise.race([
          v2ApiClient.getUserPoints(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
        ])

        const pointsData: PointsInfo = {
          current_points: response.current_points,
          total_earned: response.total_earned,
          total_spent: response.total_spent,
        }

        setPointsInfo(pointsData)
        cacheManager.set("user_points", pointsData, 2 * 60 * 1000)
        setIsInitialLoad(false)
        setError(null)
        retryCountRef.current = 0
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current)
          retryTimerRef.current = null
        }
        lastFetchRef.current = Date.now()
      } catch (err) {
        console.error("[Boat] Failed to fetch points:", err)
        if (updateLoading) {
          if (err instanceof Error && err.message === "timeout") {
            setError("ポイント情報の取得がタイムアウトしました。しばらくしてから再度お試しください。")
          } else {
            setError("ポイント情報の取得に失敗しました")
          }
        }

        const nextCount = Math.min(retryCountRef.current + 1, 5)
        retryCountRef.current = nextCount
        const backoffDelay = Math.min(60 * 1000, 5000 * Math.pow(2, nextCount - 1))

        if (!retryTimerRef.current) {
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null
            void fetchPointsInfo(false)
          }, backoffDelay)
        }
      } finally {
        if (updateLoading) setLoading(false)
      }
    },
    [],
  )

  const queueFetch = useCallback(
    (updateLoading: boolean, delay: number) => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }

      const now = Date.now()
      if (!updateLoading && now - lastFetchRef.current < 60 * 1000) {
        return
      }

      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null
        void fetchPointsInfo(updateLoading)
      }, delay)
    },
    [fetchPointsInfo],
  )

  const loadPointsInfo = useCallback(() => {
    const cacheKey = "user_points"

    if (isInitialLoad) {
      const { data: cachedData, isStale } = cacheManager.isStale<PointsInfo>(cacheKey, 60 * 1000)

      if (cachedData) {
        setPointsInfo(cachedData)
        setLoading(false)
        setIsInitialLoad(false)

        if (isStale) {
          void fetchPointsInfo(false)
        }
        return
      }
    }

    queueFetch(true, 0)
  }, [fetchPointsInfo, isInitialLoad, queueFetch])

  useEffect(() => {
    if (!session?.user?.email) return

    loadPointsInfo()

    const handlePointsUpdate = () => {
      cacheManager.remove("user_points")
      lastFetchRef.current = 0
      retryCountRef.current = 0
      queueFetch(true, 0)
    }

    window.addEventListener("pointsUpdated", handlePointsUpdate)

    return () => {
      window.removeEventListener("pointsUpdated", handlePointsUpdate)
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
    }
  }, [session?.user?.email, loadPointsInfo, queueFetch])

  if (!session) return null

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
        <div className="h-6 w-32 animate-pulse rounded-full bg-[#eff3ff]" />
        <div className="mt-2 h-8 w-24 animate-pulse rounded-full bg-[#eff3ff]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null)
            retryCountRef.current = 0
            lastFetchRef.current = 0
            queueFetch(true, 0)
          }}
          className="mt-2 font-semibold text-red-700 underline"
        >
          再読み込みする
        </button>
      </div>
    )
  }

  if (!pointsInfo) return null

  return (
    <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#102a43]">
          <Coins className="h-5 w-5 text-[#0f62fe]" />
          <h3 className="text-lg font-semibold">ポイント残高</h3>
        </div>
        <span className="text-2xl font-bold text-[#0f62fe]">
          {pointsInfo.current_points.toLocaleString()} P
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 rounded-xl bg-[#f5f8ff] px-4 py-3">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <div className="min-w-0">
            <p className="text-xs text-[#4f5d7a]">獲得合計</p>
            <p className="truncate text-base font-semibold text-[#102a43]">
              {pointsInfo.total_earned.toLocaleString()} P
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#fff1f1] px-4 py-3">
          <TrendingDown className="h-4 w-4 text-rose-500" />
          <div className="min-w-0">
            <p className="text-xs text-[#4f5d7a]">使用合計</p>
            <p className="truncate text-base font-semibold text-[#102a43]">
              {pointsInfo.total_spent.toLocaleString()} P
            </p>
          </div>
        </div>
      </div>

      {pointsInfo.current_points === 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          ポイントが不足しています。LINE連携や友達紹介でポイントを獲得しましょう。
        </div>
      )}
    </div>
  )
}
