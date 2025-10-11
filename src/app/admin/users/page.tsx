"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ArrowLeft, Search, Users as UsersIcon } from "lucide-react";

const ADMIN_EMAILS = ["goldbenchan@gmail.com", "kusanokiyoshi1@gmail.com"];

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && (!user || !ADMIN_EMAILS.includes(user.email || ""))) {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email || "")) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      // TODO: Supabase Adminから実際のユーザーデータを取得
      // 現在はモックデータ
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers([]);
    } catch (error) {
      console.error("Users fetch error:", error);
    } finally {
      setIsLoadingUsers(false);
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

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_metadata.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] via-white to-[#fafbff]">
      <header className="border-b border-[#dfe7fb] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UsersIcon className="h-8 w-8 text-[#0f62fe]" />
              <div>
                <h1 className="text-2xl font-bold text-[#102a43]">
                  ユーザー管理
                </h1>
                <p className="text-sm text-[#4f5d7a]">
                  登録ユーザーの一覧と詳細情報
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-sm font-medium text-[#0f62fe] hover:text-[#0353e9] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>管理画面に戻る</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 検索バー */}
        <div className="mb-6 rounded-2xl border border-[#dfe7fb] bg-white p-4 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4f5d7a]" />
            <input
              type="text"
              placeholder="メールアドレスまたは名前で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#dfe7fb] bg-[#f5f8ff] py-3 pl-10 pr-4 text-sm text-[#102a43] placeholder-[#848E9C] focus:border-[#0f62fe] focus:outline-none focus:ring-2 focus:ring-[#0f62fe]/20"
            />
          </div>
        </div>

        {/* ユーザー統計 */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#dfe7fb] bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-[#4f5d7a]">総ユーザー数</p>
            <p className="mt-2 text-2xl font-bold text-[#102a43]">
              {isLoadingUsers ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-[#f5f8ff]"></span>
              ) : (
                users.length
              )}
            </p>
          </div>

          <div className="rounded-xl border border-[#dfe7fb] bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-[#4f5d7a]">
              フィルタ後
            </p>
            <p className="mt-2 text-2xl font-bold text-[#102a43]">
              {filteredUsers.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#dfe7fb] bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-[#4f5d7a]">
              今月の新規登録
            </p>
            <p className="mt-2 text-2xl font-bold text-[#102a43]">0</p>
          </div>
        </div>

        {/* ユーザーテーブル */}
        <div className="rounded-2xl border border-[#dfe7fb] bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f8ff]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#4f5d7a]">
                    ユーザー
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#4f5d7a]">
                    登録日
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#4f5d7a]">
                    最終ログイン
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe7fb]">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0f62fe] border-r-transparent"></div>
                      <p className="mt-2 text-sm text-[#4f5d7a]">
                        読み込み中...
                      </p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <UsersIcon className="mx-auto h-12 w-12 text-[#848E9C]" />
                      <p className="mt-2 text-sm font-medium text-[#4f5d7a]">
                        {searchQuery
                          ? "該当するユーザーが見つかりません"
                          : "まだユーザーが登録されていません"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#f5f8ff] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {user.user_metadata.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt=""
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f62fe] text-white">
                              <span className="text-sm font-semibold">
                                {user.email[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[#102a43]">
                              {user.user_metadata.name || "名前未設定"}
                            </p>
                            <p className="text-sm text-[#4f5d7a]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4f5d7a]">
                        {new Date(user.created_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4f5d7a]">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString(
                              "ja-JP"
                            )
                          : "未ログイン"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
