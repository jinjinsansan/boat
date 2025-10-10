"use client";

import { useState } from "react";
import Link from "next/link";

import { getSupabaseClient } from "@/lib/supabaseClient";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "サインインに失敗しました");
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="space-y-4">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#3dd6d0]">
            Sign In
          </span>
          <h1 className="text-3xl font-semibold text-[#0b1533]">
            競艇版 D-Logic にログイン / 登録
          </h1>
          <p className="text-sm text-[#4f5d7a]">
            Google アカウントで簡単にサインインし、競艇分析ダッシュボードのクローズドβへアクセスできます。
          </p>
        </div>

        <div className="w-full max-w-sm rounded-[28px] border border-[#e5ecfb] bg-[#f9fbff] p-8 shadow-[0_22px_45px_rgba(11,21,51,0.08)]">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0f62fe] px-6 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0f62fe]">G</span>
            <span>{loading ? "リダイレクト中..." : "Google でサインイン"}</span>
          </button>
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
          <p className="mt-6 text-xs text-[#4f5d7a]">
            利用規約およびプライバシーポリシーに同意した上でログインしてください。競艇版 D-Logic の詳細は
            <Link href="/" className="ml-1 text-[#0f62fe] underline">
              ホーム
            </Link>
            をご覧ください。
          </p>
        </div>
      </div>
    </div>
  );
}
