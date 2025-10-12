// V2 APIクライアント（競艇版）
// バックエンドのV2エンドポイントと通信
// Next-Authのセッションを使用して認証

import { getSession } from 'next-auth/react';

const V2_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class V2ApiClient {
  private baseUrl: string;
  private sessionCache: { session: any; timestamp: number } | null = null;
  private readonly SESSION_CACHE_DURATION = 30000; // 30秒キャッシュ

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://boat-wdxs.onrender.com';
  }
  
  // セッションキャッシュ付きの取得
  private async getCachedSession() {
    const now = Date.now();
    
    // キャッシュが有効かチェック
    if (this.sessionCache && 
        (now - this.sessionCache.timestamp) < this.SESSION_CACHE_DURATION) {
      console.log('[Boat V2] Session: Using cached session');
      return this.sessionCache.session;
    }
    
    // 新しいセッションを取得
    console.log('[Boat V2] authenticatedFetch: Getting fresh session...');
    const session = await getSession();
    
    // キャッシュを更新
    this.sessionCache = {
      session,
      timestamp: now
    };
    
    console.log('[Boat V2] Session:', session);
    return session;
  }

  // 基本的なAPIリクエスト（認証なし）
  private async fetchApi<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = performance.now();
    
    console.log('[Boat V2] API Request:', {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      const responseTime = performance.now() - startTime;
      
      console.log('[Boat V2] API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseTime: `${responseTime.toFixed(0)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // 遅いAPIコールを警告
      if (responseTime > 3000) {
        console.warn(`⚠️ Slow API call detected: ${endpoint} took ${responseTime.toFixed(0)}ms`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Boat V2] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          endpoint
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[Boat V2] API Response Data:', data);
      return data;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      console.error('[Boat V2] API Error:', {
        endpoint,
        error: error instanceof Error ? error.message : String(error),
        responseTime: `${responseTime.toFixed(0)}ms`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
  
  // 認証付きリクエスト（キャッシュされたセッション使用）
  private async authenticatedFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const session = await this.getCachedSession();
    
    if (!session?.user?.email) {
      console.error('[Boat V2] Auth Error: No session or email found', session);
      // セッションキャッシュをクリア
      this.sessionCache = null;
      throw new Error('Not authenticated');
    }
    
    console.log('[Boat V2] Auth: Using email for auth:', session.user.email);
    
    return this.fetchApi<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${session.user.email}`,
      },
    });
  }

  // セッションキャッシュクリア（必要時）
  clearSessionCache() {
    this.sessionCache = null;
    console.log('[Boat V2] Session cache cleared');
  }
  
  // ヘルスチェック
  async checkHealth() {
    return this.fetchApi<{ status: string }>('/api/v2/health/');
  }

  // ユーザーポイント取得
  async getUserPoints() {
    return this.authenticatedFetch<{
      current_points: number;
      total_earned: number;
      total_spent: number;
      can_create_chat: boolean;
    }>('/api/v2/points/status');
  }

  // チャットセッション作成
  async createChatSession(sessionData: any) {
    return this.authenticatedFetch<{
      chat_id: string;
      session_id: string;
    }>('/api/v2/chat/create', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // チャットセッション取得
  async getChatSession(sessionId: string) {
    return this.authenticatedFetch<any>(`/api/v2/chat/session/${sessionId}`);
  }

  // チャットセッション一覧取得
  async getChatSessions(limit: number = 10, offset: number = 0) {
    return this.authenticatedFetch<{
      sessions: any[];
      limit: number;
      offset: number;
      total: number;
    }>(`/api/v2/chat/sessions?limit=${limit}&offset=${offset}`);
  }

  // メッセージ送信
  async sendMessage(sessionId: string, messageData: any) {
    return this.authenticatedFetch<{
      message: any;
    }>(`/api/v2/chat/session/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // ポイント取引履歴を取得
  async getTransactions(limit: number = 20, offset: number = 0) {
    return this.authenticatedFetch<{
      transactions: Array<{
        id: string;
        transaction_type: string;
        amount: number;
        description: string;
        created_at: string;
      }>;
      limit: number;
      offset: number;
    }>(`/api/v2/points/transactions?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  }
}

// シングルトンインスタンス
export const v2ApiClient = new V2ApiClient();
