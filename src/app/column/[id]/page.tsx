'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Eye, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

interface Column {
  id: string;
  title: string;
  summary: string;
  content: string;
  featured_image: string;
  access_type: string;
  required_points: number;
  published_at: string;
  view_count: number;
  category: {
    id: string;
    name: string;
  };
}

export default function ColumnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const columnId = params.id as string;
  
  const [column, setColumn] = useState<Column | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRead, setIsRead] = useState(false);
  const [consuming, setConsuming] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchColumn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    
    if (user) {
      await fetchUserPoints();
      await checkReadStatus();
    }
  };

  const fetchUserPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('https://boat-backend-v95t.onrender.com/api/v2/points/balance', {
        headers: {
          'X-User-Email': user.email || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPoints(data.current_points || 0);
      }
    } catch (error) {
      console.error('ポイント取得エラー:', error);
    }
  };

  const checkReadStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;
      
      if (!accessToken) return;

      const response = await fetch(
        `https://boat-backend-v95t.onrender.com/api/v2/column/read-status/${columnId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsRead(data.is_read);
      }
    } catch (error) {
      console.error('既読状態確認エラー:', error);
    }
  };

  const fetchColumn = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('v2_columns')
      .select(`
        id,
        title,
        summary,
        content,
        featured_image,
        access_type,
        required_points,
        published_at,
        view_count,
        category:column_categories(id, name)
      `)
      .eq('id', columnId)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      alert('コラムが見つかりません');
      router.push('/column');
      return;
    }

    const mappedData = {
      ...data,
      category: Array.isArray(data.category) ? data.category[0] : data.category
    };
    
    setColumn(mappedData);
    setLoading(false);
  };

  const handleConsumePoints = async () => {
    if (!isAuthenticated) {
      alert('ログインが必要です');
      router.push('/auth/signin');
      return;
    }

    if (currentPoints < (column?.required_points || 0)) {
      alert('ポイントが不足しています');
      return;
    }

    setConsuming(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;

      if (!accessToken) {
        alert('認証エラーが発生しました');
        return;
      }

      const response = await fetch(
        `https://boat-backend-v95t.onrender.com/api/v2/column/view/${columnId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.error === 'insufficient_points') {
          alert(`ポイントが不足しています。必要: ${result.required_points}pt、現在: ${result.current_points}pt`);
        } else {
          alert('コラムの閲覧に失敗しました');
        }
        return;
      }

      // 既読フラグを立てる
      setIsRead(true);
      
      // ポイント残高を更新
      if (result.balance_after !== undefined) {
        setCurrentPoints(result.balance_after);
      } else {
        await fetchUserPoints();
      }

      alert(`${result.points_used}ポイントを消費しました`);
    } catch (error) {
      console.error('ポイント消費エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setConsuming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!column) {
    return null;
  }

  const canViewContent =
    column.access_type === 'free' ||
    (column.access_type === 'point_required' && isRead);

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>

          {/* カテゴリ */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded">
              {column.category?.name || '未分類'}
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {column.title}
          </h1>

          {/* メタ情報 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              {format(new Date(column.published_at), 'yyyy年MM月dd日', { locale: ja })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {column.view_count}
            </span>
            {column.access_type === 'free' && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <Unlock className="w-4 h-4" />
                無料
              </span>
            )}
            {column.access_type === 'point_required' && (
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <Lock className="w-4 h-4" />
                {column.required_points}ポイント
              </span>
            )}
          </div>
        </div>
      </div>

      {/* アイキャッチ画像 */}
      {column.featured_image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <img
            src={column.featured_image}
            alt={column.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* 本文 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 要約 */}
        {column.summary && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-gray-700">{column.summary}</p>
          </div>
        )}

        {/* ポイント消費が必要な場合 */}
        {column.access_type === 'point_required' && !isRead && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 text-center mb-8">
            <Lock className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              このコラムは{column.required_points}ポイントで閲覧できます
            </h3>
            <p className="text-gray-600 mb-6">
              {isAuthenticated ? (
                <>現在のポイント: <span className="font-bold text-blue-600">{currentPoints}pt</span></>
              ) : (
                <>ログインしてポイントで閲覧</>
              )}
            </p>
            {isAuthenticated ? (
              <button
                onClick={handleConsumePoints}
                disabled={consuming || currentPoints < column.required_points}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {consuming ? (
                  '処理中...'
                ) : currentPoints < column.required_points ? (
                  `ポイント不足（あと${column.required_points - currentPoints}pt必要）`
                ) : (
                  `${column.required_points}ポイントで読む`
                )}
              </button>
            ) : (
              <button
                onClick={() => router.push('/auth/signin')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                ログインして読む
              </button>
            )}
          </div>
        )}

        {/* 本文表示 */}
        {canViewContent && (
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                strong: ({ ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                em: ({ ...props }) => <em className="italic" {...props} />,
                a: ({ ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4" {...props} />
                ),
                code: ({ inline, ...props }: { inline?: boolean; [key: string]: unknown }) =>
                  inline ? (
                    <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono" {...props} />
                  ) : (
                    <code className="block bg-gray-100 rounded p-4 text-sm font-mono overflow-x-auto my-4" {...props} />
                  ),
              }}
            >
              {column.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
