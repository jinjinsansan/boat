import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let adminClient: SupabaseClient | null = null

if (supabaseUrl && supabaseServiceRoleKey) {
  adminClient = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
} else if (process.env.NODE_ENV !== 'production') {
  console.warn('[Boat] Supabase admin client is disabled: missing environment variables')
}

// サーバーサイド用のクライアント（管理者権限）。環境変数が未設定の場合は null。
export const supabaseAdmin = adminClient
