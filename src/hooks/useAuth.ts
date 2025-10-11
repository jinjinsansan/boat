"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = getSupabaseClient();

      // 初回セッション取得
      supabase.auth
        .getSession()
        .then(({ data: { session }, error }) => {
          if (error) {
            console.error("Session fetch error:", error);
            setError(error.message);
          }
          setUser(session?.user ?? null);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Session fetch exception:", err);
          setError(err.message);
          setLoading(false);
        });

      // 認証状態の変更を監視
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setError(null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error("useAuth initialization error:", err);
      setError(err instanceof Error ? err.message : "認証エラーが発生しました");
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}
