"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // URLのハッシュフラグメントからセッション情報を取得
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          setTimeout(() => router.push("/auth/sign-in"), 3000);
          return;
        }

        if (data.session) {
          // セッションが存在する場合、マイページにリダイレクト
          router.push("/my-account");
        } else {
          // セッションがない場合、サインインページに戻る
          router.push("/auth/sign-in");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "認証処理に失敗しました");
        setTimeout(() => router.push("/auth/sign-in"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md space-y-4 p-6 text-center">
          <div className="text-red-500">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#102a43]">認証エラー</h2>
          <p className="text-sm text-[#4f5d7a]">{error}</p>
          <p className="text-xs text-[#848E9C]">
            3秒後にサインインページへリダイレクトします...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="space-y-4 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#0f62fe] border-r-transparent"></div>
        <p className="text-sm text-[#4f5d7a]">認証処理中...</p>
      </div>
    </div>
  );
}
