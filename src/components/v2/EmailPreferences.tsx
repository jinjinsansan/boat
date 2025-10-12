"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Bell, BellOff, CheckCircle, Mail, Settings } from "lucide-react"

interface EmailPreferencesProps {
  userEmail: string
}

type Frequency = "normal" | "weekly" | "monthly" | "stopped"

export default function EmailPreferences({ userEmail }: EmailPreferencesProps) {
  const [frequency, setFrequency] = useState<Frequency>("normal")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v2/account/email-preferences?email=${encodeURIComponent(userEmail)}`,
        )
        if (response.ok) {
          const data = await response.json()
          setFrequency((data.frequency || "normal") as Frequency)
        }
      } catch (error) {
        console.error("[Boat] メール設定取得エラー:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [userEmail])

  const handleFrequencyChange = async (newFrequency: Frequency) => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/account/email-preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, frequency: newFrequency }),
      })

      if (response.ok) {
        setFrequency(newFrequency)
        setMessage({
          type: "success",
          text: newFrequency === "stopped" ? "メール配信を停止しました" : "配信頻度を変更しました",
        })
      } else {
        throw new Error("更新に失敗しました")
      }
    } catch (error) {
      console.error("[Boat] メール設定更新エラー:", error)
      setMessage({ type: "error", text: "設定の更新に失敗しました" })
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const frequencyOptions: Array<{
    value: Frequency
    label: string
    description: string
    icon: JSX.Element
    highlightClass: string
  }> = [
    {
      value: "normal",
      label: "通常配信",
      description: "週2-3回の最新情報をお届け",
      icon: <Bell className="h-5 w-5" />,
      highlightClass: "text-[#0f62fe]",
    },
    {
      value: "weekly",
      label: "週1回",
      description: "週末に1回だけ重要な情報をお届け",
      icon: <Bell className="h-5 w-5" />,
      highlightClass: "text-[#ffb11b]",
    },
    {
      value: "monthly",
      label: "月1回",
      description: "月に1回、重要なお知らせのみ",
      icon: <Bell className="h-5 w-5" />,
      highlightClass: "text-[#4f5d7a]",
    },
    {
      value: "stopped",
      label: "配信停止",
      description: "メール配信を停止します",
      icon: <BellOff className="h-5 w-5" />,
      highlightClass: "text-[#b4232a]",
    },
  ]

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-[#102a43]">
          <Mail className="h-6 w-6 text-[#0f62fe]" />
          <h3 className="text-lg font-semibold">メール配信設定</h3>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-12 animate-pulse rounded-2xl bg-[#f5f8ff]" />
          <div className="h-12 animate-pulse rounded-2xl bg-[#f5f8ff]" />
          <div className="h-12 animate-pulse rounded-2xl bg-[#f5f8ff]" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-[#102a43]">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-[#0f62fe]" />
          <h3 className="text-lg font-semibold">メール配信設定</h3>
        </div>
        <Settings className="h-5 w-5 text-[#8291b3]" />
      </div>

      <div className="mt-4 rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-xs text-[#4f5d7a]">
        <p className="font-semibold">配信先メールアドレス</p>
        <p className="mt-1 text-sm text-[#102a43]">{userEmail}</p>
      </div>

      <div className="mt-4 space-y-3">
        {frequencyOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => handleFrequencyChange(option.value)}
            disabled={isSaving || frequency === option.value}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
              frequency === option.value
                ? "border-[#0f62fe] bg-[#f5f8ff] shadow-sm"
                : "border-[#dfe7fb] bg-white hover:border-[#0f62fe]/40"
            } ${isSaving ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={option.highlightClass}>{option.icon}</span>
                  <span className={`text-sm font-semibold ${frequency === option.value ? "text-[#102a43]" : "text-[#4f5d7a]"}`}>
                    {option.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8291b3]">{option.description}</p>
              </div>
              {frequency === option.value && <CheckCircle className="h-5 w-5 text-[#0f62fe]" />}
            </div>
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-rose-200 bg-rose-50 text-rose-600"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-[11px] text-[#4f5d7a]">
        💡 LINE連携をすると、メール配信を停止してもLINEで最新情報を受け取れます。
      </div>
    </div>
  )
}
