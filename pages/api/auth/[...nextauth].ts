import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '../../../src/lib/supabase/server'
import type { NextApiRequest, NextApiResponse } from 'next'

export const authOptions = (req?: any): NextAuthOptions => ({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Googleログイン時にSupabaseにユーザーを作成/更新
      try {
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
      } catch (error) {
        console.error('[Boat] Supabase user sync error:', error)
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // ログイン後のリダイレクト処理
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, token }) {
      // セッション情報をカスタマイズ
      return session
    },
    async jwt({ token, user, account }) {
      // JWT処理
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
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
  secret: process.env.NEXTAUTH_SECRET,
})

export default (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, authOptions(req))
}
