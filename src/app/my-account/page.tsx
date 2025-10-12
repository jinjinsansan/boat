"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  User,
  LogOut,
  Settings,
  MessageSquare,
  Coins,
  Share2,
} from "lucide-react";
import Link from "next/link";

type ActiveTab = "profile" | "referral" | "chats" | "points" | "settings";

export default function MyAccountPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  useEffect(() => {
    if (!loading && !user && !error) {
      router.push("/auth/sign-in");
    }
  }, [loading, user, error, router]);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#0f62fe] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[#4f5d7a]">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#102a43] mb-2">認証エラー</h2>
          <p className="text-sm text-[#4f5d7a] mb-4">{error}</p>
          <div className="space-y-2">
            <Link
              href="/auth/sign-in"
              className="block w-full rounded-full bg-[#0f62fe] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0353e9] transition-colors"
            >
              サインインページへ
            </Link>
            <Link
              href="/"
              className="block w-full rounded-full border border-[#dfe7fb] bg-white px-6 py-3 text-sm font-semibold text-[#4f5d7a] hover:bg-[#f5f8ff] transition-colors"
            >
              ホームへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] via-white to-[#fafbff]">
      {/* ヘッダー */}
      <header className="border-b border-[#dfe7fb] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#102a43]">マイアカウント</h1>
            <Link
              href="/"
              className="text-sm font-medium text-[#0f62fe] hover:text-[#0353e9] transition-colors"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* モバイル用タブ */}
        <div className="lg:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "profile" as const, label: "プロフィール" },
              { id: "referral" as const, label: "Referral" },
              { id: "chats" as const, label: "チャット履歴" },
              { id: "points" as const, label: "ポイント" },
              { id: "settings" as const, label: "設定" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#0f62fe] text-white shadow-lg"
                    : "bg-white text-[#4f5d7a] border border-[#dfe7fb] hover:border-[#0f62fe]/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* サイドバー */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
              {/* ユーザー情報 */}
              <div className="mb-6 flex items-center space-x-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f62fe] text-white">
                    <span className="text-xl font-bold">
                      {user.user_metadata?.name?.[0] ||
                        user.email?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-[#102a43]">
                    {user.user_metadata?.name || "ユーザー"}
                  </h3>
                  <p className="truncate text-xs text-[#4f5d7a]">{user.email}</p>
                </div>
              </div>

              {/* ポイント表示 */}
              <div className="mb-6 rounded-xl border border-[#d5dff4] bg-gradient-to-br from-[#f5f8ff] to-[#e6f0ff] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-[#0f62fe]" />
                    <span className="text-sm font-medium text-[#4f5d7a]">
                      ポイント
                    </span>
                  </div>
                  <span className="text-xl font-bold text-[#0f62fe]">
                    {userPoints}
                  </span>
                </div>
              </div>

              {/* ナビゲーション */}
              <nav className="space-y-2">
                {[
                  { id: "profile" as const, icon: User, label: "プロフィール" },
                  { id: "referral" as const, icon: Share2, label: "Referral" },
                  {
                    id: "chats" as const,
                    icon: MessageSquare,
                    label: "チャット履歴",
                  },
                  { id: "points" as const, icon: Coins, label: "ポイント履歴" },
                  { id: "settings" as const, icon: Settings, label: "設定" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        activeTab === item.id
                          ? "bg-[#e6f0ff] text-[#0f62fe] border border-[#0f62fe]/30 shadow-sm"
                          : "text-[#4f5d7a] hover:bg-[#f5f8ff] hover:text-[#102a43]"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* ログアウトボタン */}
              <button
                onClick={handleSignOut}
                className="mt-6 flex w-full items-center space-x-3 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <LogOut size={20} />
                <span>ログアウト</span>
              </button>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
              {/* プロフィールタブ */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#102a43]">
                    プロフィール情報
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#4f5d7a]">
                        名前
                      </label>
                      <div className="rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-[#102a43]">
                        {user.user_metadata?.name || "未設定"}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#4f5d7a]">
                        メールアドレス
                      </label>
                      <div className="rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-[#102a43]">
                        {user.email}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#4f5d7a]">
                        アカウント種類
                      </label>
                      <div className="rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3">
                        <span className="inline-flex rounded-full bg-[#e6f0ff] px-3 py-1 text-xs font-medium text-[#0f62fe] border border-[#0f62fe]/30">
                          競艇版ユーザー
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#4f5d7a]">
                        利用可能ポイント
                      </label>
                      <div className="rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3 text-[#102a43]">
                        {userPoints}ポイント
                      </div>
                    </div>
                  </div>

                  {/* システム説明 */}
                  <div className="rounded-xl border border-[#d5dff4] bg-[#f5f8ff] p-4">
                    <h3 className="mb-2 text-sm font-semibold text-[#0f62fe]">
                      競艇版D-Logicについて
                    </h3>
                    <ul className="space-y-1 text-sm text-[#4f5d7a]">
                      <li>• レースごとにAI分析チャットを作成</li>
                      <li>• 進入・モーター・潮汐など多角的に分析</li>
                      <li>• 作成したチャットは何度でも閲覧可能</li>
                      <li>• ポイントは友達紹介などで獲得</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Referralタブ */}
              {activeTab === "referral" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#102a43]">
                    友達紹介プログラム
                  </h2>
                  <div className="rounded-xl border border-[#d5dff4] bg-[#f5f8ff] p-6 text-center">
                    <p className="text-sm text-[#4f5d7a]">
                      友達紹介機能は準備中です
                    </p>
                  </div>
                </div>
              )}

              {/* チャット履歴タブ */}
              {activeTab === "chats" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#102a43]">
                    チャット履歴
                  </h2>
                  <div className="rounded-xl border border-[#d5dff4] bg-[#f5f8ff] p-6 text-center">
                    <p className="text-sm text-[#4f5d7a]">
                      チャット履歴はまだありません
                    </p>
                    <Link
                      href="/races"
                      className="mt-4 inline-flex items-center space-x-2 rounded-full bg-[#0f62fe] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0353e9] transition-colors"
                    >
                      <MessageSquare size={16} />
                      <span>最初のチャットを作成</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ポイント履歴タブ */}
              {activeTab === "points" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#102a43]">
                    ポイント履歴
                  </h2>
                  <div className="rounded-xl border border-[#d5dff4] bg-[#f5f8ff] p-6 text-center">
                    <p className="text-sm text-[#4f5d7a]">
                      ポイント履歴はまだありません
                    </p>
                  </div>
                </div>
              )}

              {/* 設定タブ */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#102a43]">
                    アカウント設定
                  </h2>

                  <div className="rounded-xl border border-[#dfe7fb] bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-[#0f62fe]">
                      アカウント情報
                    </h3>
                    <div className="space-y-2 text-sm text-[#4f5d7a]">
                      <div className="flex justify-between">
                        <span>メールアドレス:</span>
                        <span className="text-[#102a43]">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>アカウント名:</span>
                        <span className="text-[#102a43]">
                          {user.user_metadata?.name || "未設定"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#dfe7fb] bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-[#0f62fe]">
                      プライバシー設定
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#102a43]">データの利用</p>
                        <p className="mt-0.5 text-xs text-[#4f5d7a]">
                          サービス改善のためのデータ分析
                        </p>
                      </div>
                      <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-600">
                        許可
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* モバイル用ログアウトボタン */}
        <div className="mt-6 lg:hidden">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
          >
            <LogOut size={16} />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </div>
  );
}
