"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  Calendar,
  Check,
  CheckCircle,
  ExternalLink,
  Gift,
  LineChart,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react"

import { V2_POINTS_CONFIG } from "@/config/v2-points.config"
import { v2ApiClient } from "@/lib/v2/apiClient"

interface LineStatus {
  line_connected: boolean
  line_connected_at: string | null
  has_used_referral: boolean
  referral_code: string
  referral_count: number
  line_connected_referral_count: number
  line_user_id: string | null
  has_claimed_daily_login?: boolean
  points_config?: {
    line_connect: number
    referral: number
    daily_login: number
  }
}

export function LineConnection() {
  const { data: session } = useSession()
  const [lineStatus, setLineStatus] = useState<LineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [claimingDaily, setClaimingDaily] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const LINE_ACCOUNT_ID = process.env.NEXT_PUBLIC_LINE_ACCOUNT_ID || "@082thmrq"
  const LINE_ADD_URL = `https://line.me/R/ti/p/${LINE_ACCOUNT_ID}`

  const fetchLineStatus = useCallback(async () => {
    try {
      setLoading(true)
      const response = await v2ApiClient.getLineStatus()
      setLineStatus(response)
    } catch (err) {
      console.error("[Boat] Failed to fetch LINE status:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session?.user?.email) return

    fetchLineStatus()
  }, [session?.user?.email, fetchLineStatus])

  const handleGenerateCode = async () => {
    try {
      const { code } = await v2ApiClient.generateLineVerificationCode()
      setVerificationCode(code)

      // 定期的に連携状態をチェック
      setTimeout(() => {
        const checkInterval = setInterval(async () => {
          try {
            const status = await v2ApiClient.getLineStatus()
            setLineStatus(status)

            if (status.line_connected) {
              clearInterval(checkInterval)
              window.dispatchEvent(new Event("pointsUpdated"))
            }
          } catch (error) {
            console.error("[Boat] LINE status polling error:", error)
          }
        }, 10000)

        setTimeout(() => clearInterval(checkInterval), 300000)
      }, 10000)
    } catch (error) {
      console.error("[Boat] Generate code error:", error)
      alert("認証コードの生成に失敗しました")
    }
  }

  const handleClaimDailyLogin = async () => {
    try {
      setClaimingDaily(true)
      const response = await v2ApiClient.claimDailyLogin()

      window.dispatchEvent(new Event("pointsUpdated"))
      await fetchLineStatus()

      alert(`デイリーボーナス ${response.points_granted}ポイント を獲得しました！`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : null
      alert(errorMessage || "デイリーボーナスの取得に失敗しました")
    } finally {
      setClaimingDaily(false)
    }
  }

  if (!session || loading) return null

  const pointsConfig = lineStatus?.points_config || {
    line_connect: V2_POINTS_CONFIG.LINE_CONNECT,
    referral: V2_POINTS_CONFIG.REFERRAL,
    daily_login: V2_POINTS_CONFIG.DAILY_LOGIN,
  }

  return (
    <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#102a43]">
          <MessageCircle className="h-5 w-5 text-[#0f62fe]" />
          <h3 className="text-lg font-semibold">LINE公式アカウント連携</h3>
        </div>
        <span className="text-xs font-medium text-[#4f5d7a]">ID: {LINE_ACCOUNT_ID}</span>
      </div>

      {lineStatus?.line_connected ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
              <div>
                <p className="font-semibold text-[#102a43]">LINE連携完了</p>
                <p className="text-xs text-[#4f5d7a]">
                  +{pointsConfig.line_connect}ポイント獲得済み
                </p>
              </div>
            </div>
            <Gift className="h-6 w-6 text-emerald-500" />
          </div>

          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-sm font-medium text-[#0f62fe] transition-colors hover:bg-[#eef3ff]"
          >
            <span>LINE公式アカウントを開く</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <Gift className="h-6 w-6 text-amber-500" />
              <div>
                <p className="font-semibold text-[#102a43]">
                  LINE友達追加で +{pointsConfig.line_connect} ポイント！
                </p>
                <p className="mt-1 text-sm text-[#4f5d7a]">
                  友達紹介と組み合わせると、さらにポイントが貯まります。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f62fe] text-sm font-semibold text-white">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#102a43]">LINE公式アカウントを友達追加</p>
                <a
                  href={LINE_ADD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#0f62fe] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0946c3]"
                >
                  <span>LINEで友達追加</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-[#dfe7fb] bg-white px-4 py-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd36b] text-sm font-semibold text-[#102a43]">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#102a43]">認証コードを生成</p>
                {verificationCode ? (
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] px-3 py-2 text-sm font-semibold text-[#0f62fe]">
                    <span className="font-mono tracking-wider">{verificationCode}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(verificationCode)
                          setIsCopied(true)
                          setTimeout(() => setIsCopied(false), 2000)
                        } catch {
                          const textArea = document.createElement("textarea")
                          textArea.value = verificationCode
                          textArea.style.position = "fixed"
                          textArea.style.left = "-9999px"
                          document.body.appendChild(textArea)
                          textArea.select()
                          document.execCommand("copy")
                          document.body.removeChild(textArea)
                          setIsCopied(true)
                          setTimeout(() => setIsCopied(false), 2000)
                        }
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        isCopied ? "bg-emerald-500 text-white" : "bg-[#0f62fe]/10 text-[#0f62fe] hover:bg-[#0f62fe]/20"
                      }`}
                    >
                      {isCopied ? "コピー済み" : "コピー"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#0f62fe] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0946c3]"
                  >
                    <Sparkles className="h-4 w-4" />
                    認証コードを生成
                  </button>
                )}
                {verificationCode && (
                  <p className="mt-2 text-xs text-[#4f5d7a]">LINEでコードを送信すると自動的に連携が完了します。</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#cfe3ff] bg-[#f0f6ff] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#0f62fe]" />
            <div>
              <p className="font-semibold text-[#102a43]">デイリーログインボーナス</p>
              <p className="text-xs text-[#4f5d7a]">
                {lineStatus?.has_claimed_daily_login
                  ? "本日は受け取り済み"
                  : `毎日 +${pointsConfig.daily_login} ポイント`}
              </p>
            </div>
          </div>
          {lineStatus?.has_claimed_daily_login ? (
            <div className="flex items-center gap-1 text-sm font-semibold text-[#4f5d7a]">
              <Check className="h-4 w-4 text-emerald-500" />受取済み
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClaimDailyLogin}
              disabled={claimingDaily}
              className="rounded-full bg-[#0f62fe] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0946c3] disabled:cursor-not-allowed disabled:bg-[#98b7ff]"
            >
              {claimingDaily ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />処理中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />受け取る
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {lineStatus && lineStatus.line_connected_referral_count > 0 && (
        <div className="mt-4 rounded-2xl border border-[#f5d0fe] bg-[#fdf4ff] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-[#c026d3]" />
              <div>
                <p className="font-semibold text-[#102a43]">友達紹介実績</p>
                <p className="text-xs text-[#4f5d7a]">
                  {lineStatus.line_connected_referral_count}人がLINE連携を完了
                </p>
              </div>
            </div>
            <div className="text-right text-sm font-semibold text-[#c026d3]">
              +{lineStatus.line_connected_referral_count * pointsConfig.referral} P
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
