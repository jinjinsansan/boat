# Google OAuth Setup for boat.dlogicai.in

## 必要な設定

### 1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. **APIとサービス > 認証情報** を開く
4. **OAuth 2.0 クライアントID** を選択
5. 以下を設定：

#### アプリケーションの種類
- **ウェブ アプリケーション**

#### 承認済みの JavaScript 生成元
```
https://boat.dlogicai.in
```

#### 承認済みのリダイレクト URI
```
https://boat.dlogicai.in/api/auth/callback/google
```

### 2. Vercel 環境変数

Vercelの環境変数に以下を設定：

```
NEXTAUTH_SECRET=<your-nextauth-secret>
NEXTAUTH_URL=https://boat.dlogicai.in

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

NEXT_PUBLIC_API_URL=https://boat-wdxs.onrender.com
```

**注意**: 実際の値は `.env.local` ファイルから取得してください。

### 3. トラブルシューティング

#### Configuration エラーが出る場合
1. Google Cloud Consoleのリダイレクト URIが正しいか確認
2. Vercelの環境変数が設定されているか確認
3. 環境変数を更新した後、再デプロイする

#### 確認コマンド
Vercel CLIで環境変数を確認：
```bash
vercel env ls
```

環境変数を追加：
```bash
vercel env add NEXTAUTH_URL
# 値: https://boat.dlogicai.in
```

## 現在の状況

- ✅ NextAuthの設定完了
- ✅ Google OAuthプロバイダー設定
- ⚠️ Google Cloud Consoleのリダイレクト URI設定が必要
- ⚠️ Vercel環境変数の確認が必要
