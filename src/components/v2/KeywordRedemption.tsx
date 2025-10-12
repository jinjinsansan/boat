"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Gift, Key, Loader2 } from "lucide-react"

interface KeywordRedemptionProps {
  onSuccess?: () => void
}

export default function KeywordRedemption({ onSuccess }: KeywordRedemptionProps) {
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  const handleBlur = () => {
    const katakanaOnly = keyword.replace(/[^ァ-ヴー]/g, "")
    setKeyword(katakanaOnly)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!keyword) {
      setMessage({ type: "error", text: "キーワードを入力してください" })
      return
    }

    if (keyword.length < 5) {
      setMessage({ type: "error", text: "キーワードが短すぎます" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/keywords/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "ポイントを獲得しました！" })
        setKeyword("")
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500)
        }
        window.dispatchEvent(new Event("pointsUpdated"))
      } else {
        setMessage({ type: "error", text: data.error || "無効なキーワードです" })
      }
    } catch (error) {
      console.error("[Boat] キーワード検証エラー:", error)
      setMessage({ type: "error", text: "エラーが発生しました。しばらく後にお試しください" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#fce2a2] bg-[#fff7e0] p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[#0f62fe]/10 p-3">
          <Gift className="h-6 w-6 text-[#0f62fe]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#102a43]">キャンペーンコード</h3>
          <p className="text-xs text-[#4f5d7a]">配信で発表されたキーワードを入力</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#4f5d7a]">キーワード（カタカナのみ）</label>
          <div className="relative mt-2">
            <input
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              onBlur={handleBlur}
              placeholder="キーワードヲニュウリョク"
              className="w-full rounded-full border border-[#dfe7fb] bg-white px-4 py-3 text-sm font-semibold tracking-[0.3em] text-[#102a43] placeholder-[#b0bdd9] focus:border-[#0f62fe] focus:outline-none"
              disabled={loading}
              maxLength={50}
            />
            <Key className="absolute right-4 top-3.5 h-5 w-5 text-[#8291b3]" />
          </div>
          <p className="mt-1 text-xs text-[#8291b3]">※ カタカナのみ入力可能です</p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !keyword}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f62fe] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0946c3] disabled:cursor-not-allowed disabled:bg-[#a1b9ff]"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> 検証中...
            </>
          ) : (
            <>
              <Gift className="h-5 w-5" /> ポイントを獲得する
            </>
          )}
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-[#dfe7fb] bg-white px-4 py-4 text-xs text-[#4f5d7a]">
        <h4 className="font-semibold">キャンペーンについて</h4>
        <ul className="mt-2 space-y-1">
          <li>• 配信や動画で発表されたキーワードを入力してください</li>
          <li>• 1つのキーワードは1回のみ使用可能です</li>
          <li>• キーワードには有効期限があります</li>
          <li>• 獲得したポイントは即座に反映されます</li>
        </ul>
      </div>
    </div>
  )
}
