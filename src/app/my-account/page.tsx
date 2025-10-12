"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  CreditCard,
  LogOut,
  MessageSquare,
  Settings,
  Share2,
  User,
  Wallet,
} from "lucide-react"

import AccountDeletionDialog from "@/components/v2/AccountDeletionDialog"
import BillingManagement from "@/components/v2/BillingManagement"
import { ChatHistoryList } from "@/components/v2/ChatHistoryList"
import EmailPreferences from "@/components/v2/EmailPreferences"
import { LineConnection } from "@/components/v2/LineConnection"
import KeywordRedemption from "@/components/v2/KeywordRedemption"
import { PointsDisplay } from "@/components/v2/PointsDisplay"
import { PointsHistoryList } from "@/components/v2/PointsHistoryList"
import { PointsSystemDisplay } from "@/components/v2/PointsSystemDisplay"
import { ReferralCard } from "@/components/v2/ReferralCard"
import { ReferralSectionImproved } from "@/components/v2/ReferralSectionImproved"
import InlineLoader from "@/components/common/InlineLoader"
import { v2ApiClient } from "@/lib/v2/apiClient"

type ActiveTab = "profile" | "referral" | "chats" | "points" | "billing" | "settings"

export default function MyAccountPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile")
  const [pointsSummary, setPointsSummary] = useState<{
    current: number
    totalEarned: number
    totalSpent: number
  } | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [referralCount, setReferralCount] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.email) return

    const fetchSummary = async () => {
      try {
        setSummaryLoading(true)
        const [pointsResult, referralResult] = await Promise.allSettled([
          v2ApiClient.getUserPoints(),
          v2ApiClient.getReferralStatus(),
        ])

        if (pointsResult.status === "fulfilled") {
          const { current_points, total_earned, total_spent } = pointsResult.value
          setPointsSummary({ current: current_points, totalEarned: total_earned, totalSpent: total_spent })
        }

        if (referralResult.status === "fulfilled") {
          setReferralCount(referralResult.value.line_connected_referral_count ?? 0)
        }
      } catch (error) {
        console.error("[Boat] Failed to fetch account summary:", error)
      } finally {
        setSummaryLoading(false)
      }
    }

    fetchSummary()
  }, [session?.user?.email])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleAccountDeletion = async () => {
    if (!session?.user?.email) {
      throw new Error("メールアドレスが取得できませんでした")
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/account/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.email}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result?.error || "アカウント削除に失敗しました")
    }

    window.dispatchEvent(new Event("pointsUpdated"))
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8ff]">
        <InlineLoader text="読み込み中" />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
    { id: "profile", label: "プロフィール", icon: User },
    { id: "referral", label: "紹介", icon: Share2 },
    { id: "chats", label: "チャット履歴", icon: MessageSquare },
    { id: "points", label: "ポイント履歴", icon: Wallet },
    { id: "billing", label: "決済管理", icon: CreditCard },
    { id: "settings", label: "設定", icon: Settings },
  ]

  const currentPointsText = summaryLoading ? "--" : pointsSummary?.current.toLocaleString() ?? "0"

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <header className="border-b border-[#dfe7fb] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <h1 className="text-xl font-bold text-[#102a43]">マイアカウント</h1>
          <Link href="/" className="text-sm font-semibold text-[#0f62fe] hover:text-[#0946c3]">
            ← ホームに戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="Profile" className="h-14 w-14 rounded-full border border-[#dfe7fb]" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0f62fe] text-lg font-bold text-white">
                    {user.name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#102a43]">{user.name || "ユーザー"}</p>
                  <p className="truncate text-xs text-[#4f5d7a]">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[#cfe3ff] bg-[#f0f6ff] px-4 py-3 text-sm">
                <p className="text-xs text-[#4f5d7a]">利用可能ポイント</p>
                <p className="mt-1 text-2xl font-bold text-[#0f62fe]">{currentPointsText} P</p>
              </div>
            </div>

            <nav className="hidden rounded-3xl border border-[#dfe7fb] bg-white p-4 shadow-sm lg:block">
              <ul className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                        activeTab === id ? "bg-[#f0f6ff] text-[#0f62fe]" : "text-[#4f5d7a] hover:bg-[#f5f8ff]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={handleSignOut}
              className="hidden w-full items-center justify-center gap-2 rounded-2xl border border-[#ffd3d6] bg-white px-4 py-3 text-sm font-semibold text-[#b4232a] transition-colors hover:bg-[#fff1f2] lg:flex"
            >
              <LogOut className="h-4 w-4" />ログアウト
            </button>
          </aside>

          <section className="space-y-6">
            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(({ id, label }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                      activeTab === id ? "bg-[#0f62fe] text-white" : "border border-[#dfe7fb] bg-white text-[#4f5d7a]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#dfe7fb] bg-white p-6 shadow-sm">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#102a43]">プロフィール</h2>
                    <p className="text-xs text-[#4f5d7a]">アカウントの概要情報とポイント状況を確認できます。</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3">
                      <p className="text-xs text-[#4f5d7a]">名前</p>
                      <p className="mt-1 text-sm font-semibold text-[#102a43]">{user.name || "未設定"}</p>
                    </div>
                    <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3">
                      <p className="text-xs text-[#4f5d7a]">メールアドレス</p>
                      <p className="mt-1 text-sm font-semibold text-[#102a43]">{user.email}</p>
                    </div>
                  </div>

                  <PointsDisplay />
                  <LineConnection />
                  <KeywordRedemption onSuccess={() => v2ApiClient.clearSessionCache()} />
                  <PointsSystemDisplay />
                </div>
              )}

              {activeTab === "referral" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#102a43]">友達紹介プログラム</h2>
                    <p className="text-xs text-[#4f5d7a]">紹介状況や紹介URLを確認できます。</p>
                  </div>
                  <div className="flex justify-center">
                    <ReferralCard referralCount={referralCount} />
                  </div>
                  <ReferralSectionImproved />
                </div>
              )}

              {activeTab === "chats" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#102a43]">チャット履歴</h2>
                    <p className="text-xs text-[#4f5d7a]">作成したチャットの履歴を確認できます。</p>
                  </div>
                  <ChatHistoryList />
                </div>
              )}

              {activeTab === "points" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#102a43]">ポイント履歴</h2>
                    <p className="text-xs text-[#4f5d7a]">ポイントの獲得・使用履歴を確認できます。</p>
                  </div>
                  <PointsHistoryList />
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#102a43]">決済管理</h2>
                    <p className="text-xs text-[#4f5d7a]">利用中のプランや購入機能について確認できます。</p>
                  </div>
                  <BillingManagement />
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#102a43]">アカウント設定</h2>
                    <p className="text-xs text-[#4f5d7a]">通知設定やアカウント削除を管理します。</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3">
                      <p className="text-xs text-[#4f5d7a]">メールアドレス</p>
                      <p className="mt-1 text-sm font-semibold text-[#102a43]">{user.email}</p>
                    </div>
                    <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3">
                      <p className="text-xs text-[#4f5d7a]">アカウント種別</p>
                      <p className="mt-1 inline-flex rounded-full bg-[#f0f6ff] px-3 py-1 text-xs font-semibold text-[#0f62fe]">
                        競艇版ユーザー
                      </p>
                    </div>
                  </div>

                  <EmailPreferences userEmail={user.email ?? ""} />

                  <div className="rounded-2xl border border-[#ffd3d6] bg-[#fff1f2] p-4">
                    <h3 className="text-sm font-semibold text-[#b4232a]">危険ゾーン</h3>
                    <p className="mt-2 text-xs text-[#4f5d7a]">
                      アカウントを削除すると、すべてのデータが永久に失われます。
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteDialog(true)}
                      className="mt-3 rounded-full bg-[#b4232a] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#92141f]"
                    >
                      アカウントを削除
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ffd3d6] bg-white px-4 py-3 text-sm font-semibold text-[#b4232a] transition-colors hover:bg-[#fff1f2] lg:hidden"
            >
              <LogOut className="h-4 w-4" />ログアウト
            </button>
          </section>
        </section>
      </main>

      <AccountDeletionDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleAccountDeletion}
        userEmail={user.email ?? ""}
      />
    </div>
  )
}
