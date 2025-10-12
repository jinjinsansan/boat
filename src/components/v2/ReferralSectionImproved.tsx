"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  AlertCircle,
  Gift,
  Share2,
  Users,
} from "lucide-react"

import { buildInviteUrl } from "@/lib/env"
import { v2ApiClient } from "@/lib/v2/apiClient"

interface ReferralStatus {
  referral_code: string
  line_connected_referral_count: number
  pending_referral_count: number
  total_referral_count: number
  next_bonus_points: number
  referral_url: string
  bonus_structure: {
    "1人目": number
    "2人目": number
    "3人目": number
    "4人目": number
    "5人目以降": number
  }
}

interface LineStatus {
  has_used_referral: boolean
  line_connected: boolean
}

export function ReferralSectionImproved() {
  const { data: session } = useSession()
  const [referralStatus, setReferralStatus] = useState<ReferralStatus | null>(null)
  const [lineStatus, setLineStatus] = useState<LineStatus | null>(null)
  const [referralCodeInput, setReferralCodeInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fetched, setFetched] = useState(false)

  const generateReferralCode = (email: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let hash = 0
    for (let i = 0; i < email.length; i += 1) {
      hash = (hash << 5) - hash + email.charCodeAt(i)
      hash |= 0
    }
    hash = Math.abs(hash)
    let code = ""
    for (let i = 0; i < 6; i += 1) {
      code += chars[hash % chars.length]
      hash = Math.floor(hash / chars.length)
    }
    return code
  }

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true)

      const status = await v2ApiClient.getReferralStatus().catch((error) => {
        console.error("[Boat] Failed to fetch referral status:", error)
        return null
      })

      if (status?.referral_code) {
        const referralUrl = buildInviteUrl(status.referral_code)

        const bonusStructure = {
          "1人目": 30,
          "2人目": 40,
          "3人目": 50,
          "4人目": 60,
          "5人目以降": 100,
        }

        setReferralStatus({
          referral_code: status.referral_code,
          referral_url: referralUrl,
          line_connected_referral_count: status.line_connected_referral_count ?? 0,
          pending_referral_count: status.pending_referral_count ?? 0,
          total_referral_count: status.total_referral_count ?? 0,
          next_bonus_points: status.next_bonus_points ?? 0,
          bonus_structure: bonusStructure,
        })
      }

      const lineStatusResponse = await v2ApiClient.getLineStatus().catch((error) => {
        console.error("[Boat] Failed to fetch line status:", error)
        return null
      })

      if (lineStatusResponse) {
        setLineStatus({
          has_used_referral: lineStatusResponse.has_used_referral,
          line_connected: lineStatusResponse.line_connected,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.email && !fetched) {
      const immediateCode = generateReferralCode(session.user.email)
      const immediateUrl = buildInviteUrl(immediateCode)

      setReferralStatus({
        referral_code: immediateCode,
        referral_url: immediateUrl,
        line_connected_referral_count: 0,
        pending_referral_count: 0,
        total_referral_count: 0,
        next_bonus_points: 30,
        bonus_structure: {
          "1人目": 30,
          "2人目": 40,
          "3人目": 50,
          "4人目": 60,
          "5人目以降": 100,
        },
      })

      setFetched(true)
      fetchReferralData()
    }
  }, [session?.user?.email, fetched, fetchReferralData])

  const handleCopyUrl = () => {
    if (!referralStatus) return

    navigator.clipboard.writeText(referralStatus.referral_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyReferralCode = async () => {
    const trimmed = referralCodeInput.trim()
    if (!trimmed) {
      alert("紹介コードを入力してください")
      return
    }

    if (trimmed.length !== 6) {
      alert("紹介コードは6文字です")
      return
    }

    try {
      setApplying(true)
      const response = await v2ApiClient.applyReferralCode(trimmed.toUpperCase())

      window.dispatchEvent(new Event("pointsUpdated"))
      await fetchReferralData()
      setReferralCodeInput("")

      let message = "紹介コードが適用されました！"
      if (response.points_granted) {
        message += `\n${response.points_granted}ポイントを獲得しました！`
      }
      if (response.note) {
        message += `\n\n${response.note}`
      }
      alert(message)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : null
      alert(errorMessage || "紹介コードの適用に失敗しました")
    } finally {
      setApplying(false)
    }
  }

  if (!session || loading) return null

  return (
    <div className="space-y-6">
      {lineStatus && !lineStatus.has_used_referral && (
        <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#102a43]">
            <Gift className="h-5 w-5 text-[#0f62fe]" />
            <h3 className="text-lg font-semibold">友達の紹介コードをお持ちですか？</h3>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
              placeholder="紹介コード（6文字）"
              maxLength={6}
              className="flex-1 rounded-full border border-[#dfe7fb] px-4 py-3 text-sm font-medium text-[#102a43] placeholder-[#9aa8c3] focus:border-[#0f62fe] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyReferralCode}
              disabled={applying || referralCodeInput.length !== 6}
              className="rounded-full bg-[#0f62fe] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0946c3] disabled:cursor-not-allowed disabled:bg-[#a1b9ff]"
            >
              {applying ? "処理中..." : "適用する"}
            </button>
          </div>
          <div className="mt-3 rounded-xl border border-[#fce2a2] bg-[#fff7e0] px-4 py-3 text-xs text-[#8f6a04]">
            紹介コードを使用すると、すぐに10ポイント獲得できます。友達のLINE連携で紹介者にもボーナスが付与されます。
          </div>
        </div>
      )}

      {referralStatus && (
        <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#102a43]">
            <Share2 className="h-5 w-5 text-[#0f62fe]" />
            <h3 className="text-lg font-semibold">紹介実績</h3>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-center">
              <p className="text-xs text-[#4f5d7a]">LINE連携済み</p>
              <p className="mt-1 text-2xl font-bold text-[#0f62fe]">
                {referralStatus.line_connected_referral_count}
              </p>
            </div>
            <div className="rounded-2xl border border-[#dfe7fb] bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-xs text-[#4f5d7a]">連携待ち</p>
              <p className="mt-1 text-2xl font-bold text-[#f97316]">
                {referralStatus.pending_referral_count}
              </p>
            </div>
            <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-center">
              <p className="text-xs text-[#4f5d7a]">次回ボーナス</p>
              <p className="mt-1 text-2xl font-bold text-[#102a43]">
                {referralStatus.next_bonus_points} pt
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#dfe7fb] bg-white px-4 py-4">
            <p className="text-xs font-semibold text-[#4f5d7a]">LINE連携完了時のボーナス</p>
            <div className="mt-2 space-y-2 text-xs text-[#102a43]">
              {Object.entries(referralStatus.bonus_structure).map(([label, value]) => {
                const personNum = parseInt(label.match(/\d+/)?.[0] ?? "0", 10)
                const isAchieved = personNum <= referralStatus.line_connected_referral_count
                const isNext = personNum === referralStatus.line_connected_referral_count + 1

                return (
                  <div
                    key={label}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                      isAchieved
                        ? "bg-emerald-50 text-emerald-600"
                        : isNext
                        ? "bg-[#f5f8ff] text-[#0f62fe]"
                        : "bg-white text-[#4f5d7a]"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="font-semibold">{value} pt {isAchieved && "✓"}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {referralStatus.pending_referral_count > 0 && (
            <div className="mt-4 rounded-2xl border border-[#fce2a2] bg-[#fff7e0] px-4 py-3 text-xs text-[#8f6a04]">
              連携待ちの友達がいます。LINE連携を完了してもらうとボーナスポイントが付与されます。
            </div>
          )}
        </div>
      )}

      {referralStatus && (
        <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#102a43]">
            <Users className="h-5 w-5 text-[#0f62fe]" />
            <h3 className="text-lg font-semibold">友達を紹介する</h3>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-[#4f5d7a]">あなたの紹介コード</p>
            <p className="mt-1 text-3xl font-bold tracking-[0.4em] text-[#0f62fe]">
              {referralStatus.referral_code}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-4">
            <p className="text-xs text-[#4f5d7a]">紹介URL</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={referralStatus.referral_url}
                readOnly
                className="flex-1 overflow-hidden text-ellipsis rounded-full border border-[#dfe7fb] bg-white px-4 py-3 text-sm text-[#102a43]"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="rounded-full bg-[#0f62fe] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0946c3]"
              >
                {copied ? "コピー済み" : "コピー"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#dfe7fb] bg-white px-4 py-4">
            <p className="text-xs font-semibold text-[#4f5d7a]">紹介の流れ</p>
            <ol className="mt-2 space-y-1 text-xs text-[#102a43]">
              <li>1. 紹介コードを友達に共有して、10ポイントをプレゼント</li>
              <li>2. 友達がLINE連携を完了すると、あなたに追加ボーナス</li>
            </ol>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `競艇AI D-Logic Boatに招待します！\n紹介コード「${referralStatus.referral_code}」でポイントGET！\n`,
              )}&url=${encodeURIComponent(referralStatus.referral_url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#1DA1F2] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0f8ad6]"
            >
              Xでシェア
            </a>
            <a
              href={`https://line.me/R/msg/text/?${encodeURIComponent(
                `競艇AI D-Logic Boatに招待します！\n紹介コード「${referralStatus.referral_code}」でポイントGET！\n${referralStatus.referral_url}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#06C755] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#05a849]"
            >
              LINEで送る
            </a>
          </div>
        </div>
      )}

      {!referralStatus && !loading && (
        <div className="rounded-2xl border border-[#ffd3d6] bg-[#fff1f2] px-4 py-3 text-sm text-[#b4232a]">
          <AlertCircle className="mr-2 inline h-4 w-4" />紹介情報の取得に失敗しました。しばらくしてから再度お試しください。
        </div>
      )}
    </div>
  )
}
