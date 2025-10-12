import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextApiRequest, NextApiResponse } from 'next'

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? (process.env.NODE_ENV !== 'production' ? 'development-secret' : undefined)

if (!googleClientId || !googleClientSecret) {
  console.error('[Boat] Missing Google OAuth environment variables. Please set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET (or AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET).')
  throw new Error('Missing Google OAuth environment variables')
}

if (!nextAuthSecret) {
  console.error('[Boat] Missing NextAuth secret. Please set NEXTAUTH_SECRET (or AUTH_SECRET).')
  throw new Error('Missing NextAuth secret environment variable')
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Googleログイン時にSupabaseにユーザーを作成/更新（オプショナル）
      try {
        // Supabase接続をスキップ（まずはサインインを優先）
        console.log('[Boat] User signed in:', user.email);
        // TODO: 後でSupabase連携を有効化
        /*
        const { data: existingUser } = await supabaseAdmin
          .from('v2_users')
          .select('*')
          .eq('email', user.email!)
          .single()

        if (!existingUser) {
          // 新規ユーザーを作成
          const { data: newUser } = await supabaseAdmin
            .from('v2_users')
            .insert({
              email: user.email!,
              name: user.name,
              google_id: account?.providerAccountId,
              avatar_url: user.image,
            })
            .select()
            .single()

          if (newUser) {
            // V2ポイント初期化（初回登録ボーナス2ポイント）
            await supabaseAdmin
              .from('v2_user_points')
              .insert({
                user_id: newUser.id,
                current_points: 2,  // 初回登録ボーナス
                total_earned: 2,
                total_spent: 0
              })
          }
        } else {
          // 既存ユーザーの情報を更新
          await supabaseAdmin
            .from('v2_users')
            .update({
              name: user.name,
              google_id: account?.providerAccountId,
              avatar_url: user.image,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingUser.id)
        }
        */
      } catch (error) {
        console.error('[Boat] Supabase user sync error (non-blocking):', error)
        // エラーが出てもサインインは成功させる
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // ログイン後のリダイレクト処理
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session }) {
      // セッション情報をカスタマイズ
      return session
    },
    async jwt({ token, user }) {
      // JWT処理
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    // Use NextAuth default error page
    // error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // JWTベースのセッション管理
    maxAge: 30 * 24 * 60 * 60, // 30日間
    updateAge: 24 * 60 * 60, // 24時間ごとに更新
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.dlogicai.in' : undefined
      }
    }
  },
  secret: nextAuthSecret,
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions)
}
