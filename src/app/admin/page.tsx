"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  Activity,
  Database,
  Coins,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileText,
  MessagesSquare,
} from "lucide-react";

// 管理者メールアドレス
const ADMIN_EMAILS = ["goldbenchan@gmail.com", "kusanokiyoshi1@gmail.com"];

interface DashboardStats {
  totalUsers: number;
  totalChats: number;
  totalPoints: number;
  systemStatus: "operational" | "degraded" | "maintenance";
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalChats: 0,
    totalPoints: 0,
    systemStatus: "operational",
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !ADMIN_EMAILS.includes(user.email || ""))) {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email || "")) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      // TODO: 実際のAPIエンドポイントを実装後に接続
      // 現在はモックデータ
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStats({
        totalUsers: 0,
        totalChats: 0,
        totalPoints: 0,
        systemStatus: "operational",
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (loading || !user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#0f62fe] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[#4f5d7a]">認証確認中...</p>
        </div>
      </div>
    );
  }

  const statusColor =
    stats.systemStatus === "operational"
      ? "text-green-500"
      : stats.systemStatus === "degraded"
        ? "text-yellow-500"
        : "text-red-500";

  const statusIcon =
    stats.systemStatus === "operational" ? CheckCircle : AlertCircle;
  const StatusIcon = statusIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] via-white to-[#fafbff]">
      {/* ヘッダー */}
      <header className="border-b border-[#dfe7fb] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <h1 className="text-2xl font-bold text-[#102a43]">
                  管理者パネル
                </h1>
                <p className="text-sm text-[#4f5d7a]">
                  競艇版 D-Logic 管理ダッシュボード
                </p>
              </div>
            </div>
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
        {/* システムステータス */}
        <div className="mb-8 rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <StatusIcon className={`h-6 w-6 ${statusColor}`} />
              <div>
                <h2 className="text-lg font-semibold text-[#102a43]">
                  システムステータス
                </h2>
                <p className="text-sm text-[#4f5d7a]">
                  {stats.systemStatus === "operational"
                    ? "正常稼働中"
                    : stats.systemStatus === "degraded"
                      ? "一部機能制限中"
                      : "メンテナンス中"}
                </p>
              </div>
            </div>
            <button
              onClick={fetchDashboardStats}
              disabled={isLoadingStats}
              className="rounded-full border border-[#dfe7fb] bg-white px-4 py-2 text-sm font-medium text-[#4f5d7a] hover:bg-[#f5f8ff] transition-colors disabled:opacity-50"
            >
              {isLoadingStats ? "更新中..." : "更新"}
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4f5d7a]">
                  総ユーザー数
                </p>
                <p className="mt-2 text-3xl font-bold text-[#102a43]">
                  {isLoadingStats ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded bg-[#f5f8ff]"></span>
                  ) : (
                    stats.totalUsers
                  )}
                </p>
              </div>
              <Users className="h-12 w-12 text-[#0f62fe]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4f5d7a]">
                  総チャット数
                </p>
                <p className="mt-2 text-3xl font-bold text-[#102a43]">
                  {isLoadingStats ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded bg-[#f5f8ff]"></span>
                  ) : (
                    stats.totalChats
                  )}
                </p>
              </div>
              <MessageSquare className="h-12 w-12 text-[#0f62fe]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4f5d7a]">
                  発行済ポイント
                </p>
                <p className="mt-2 text-3xl font-bold text-[#102a43]">
                  {isLoadingStats ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded bg-[#f5f8ff]"></span>
                  ) : (
                    stats.totalPoints
                  )}
                </p>
              </div>
              <Coins className="h-12 w-12 text-[#0f62fe]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4f5d7a]">
                  システム稼働率
                </p>
                <p className="mt-2 text-3xl font-bold text-[#102a43]">
                  99.9%
                </p>
              </div>
              <Activity className="h-12 w-12 text-[#0f62fe]" />
            </div>
          </div>
        </div>

        {/* 管理メニュー */}
        <div className="rounded-2xl border border-[#dfe7fb] bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-lg font-semibold text-[#102a43]">
            管理メニュー
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/users"
              className="group flex items-center space-x-4 rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] p-4 transition-all hover:border-[#0f62fe]/40 hover:bg-[#e6f0ff]"
            >
              <Users className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <p className="font-semibold text-[#102a43]">ユーザー管理</p>
                <p className="text-sm text-[#4f5d7a]">
                  ユーザー一覧と詳細
                </p>
              </div>
            </Link>

            <Link
              href="/admin/columns"
              className="group flex items-center space-x-4 rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] p-4 transition-all hover:border-[#0f62fe]/40 hover:bg-[#e6f0ff]"
            >
              <FileText className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <p className="font-semibold text-[#102a43]">コラム管理</p>
                <p className="text-sm text-[#4f5d7a]">
                  コラム作成と編集
                </p>
              </div>
            </Link>

            <Link
              href="/expert-rooms"
              className="group flex items-center space-x-4 rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] p-4 transition-all hover:border-[#0f62fe]/40 hover:bg-[#e6f0ff]"
            >
              <MessagesSquare className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <p className="font-semibold text-[#102a43]">予想家部屋管理</p>
                <p className="text-sm text-[#4f5d7a]">
                  オープンチャット管理
                </p>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="group flex items-center space-x-4 rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] p-4 transition-all hover:border-[#0f62fe]/40 hover:bg-[#e6f0ff]"
            >
              <BarChart3 className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <p className="font-semibold text-[#102a43]">分析</p>
                <p className="text-sm text-[#4f5d7a]">
                  利用状況と統計
                </p>
              </div>
            </Link>

            <Link
              href="/admin/database"
              className="group flex items-center space-x-4 rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] p-4 transition-all hover:border-[#0f62fe]/40 hover:bg-[#e6f0ff]"
            >
              <Database className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <p className="font-semibold text-[#102a43]">データベース</p>
                <p className="text-sm text-[#4f5d7a]">
                  バックアップと管理
                </p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="group flex items-center space-x-4 rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] p-4 transition-all hover:border-[#0f62fe]/40 hover:bg-[#e6f0ff]"
            >
              <Settings className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <p className="font-semibold text-[#102a43]">システム設定</p>
                <p className="text-sm text-[#4f5d7a]">
                  全般設定と構成
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-4 rounded-xl border border-[#d5dff4] bg-[#f9fbff] p-4 opacity-60">
              <TrendingUp className="h-8 w-8 text-[#4f5d7a]" />
              <div>
                <p className="font-semibold text-[#4f5d7a]">
                  レポート
                  <span className="ml-2 text-xs">準備中</span>
                </p>
                <p className="text-sm text-[#848E9C]">
                  詳細レポート機能
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 rounded-xl border border-[#d5dff4] bg-[#f9fbff] p-4 opacity-60">
              <Shield className="h-8 w-8 text-[#4f5d7a]" />
              <div>
                <p className="font-semibold text-[#4f5d7a]">
                  セキュリティ
                  <span className="ml-2 text-xs">準備中</span>
                </p>
                <p className="text-sm text-[#848E9C]">
                  アクセス制御とログ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">管理者権限でログイン中</p>
              <p className="mt-1">
                この画面は管理者のみがアクセスできます。システムの重要な設定を変更する際は十分ご注意ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
