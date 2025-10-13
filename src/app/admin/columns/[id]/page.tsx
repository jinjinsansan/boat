'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function EditColumnPage() {
  const params = useParams();
  const columnId = params.id as string;
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [accessType, setAccessType] = useState<'free' | 'point_required' | 'line_linked'>('free');
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPermission();
    fetchCategories();
    fetchColumn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnId]);

  const checkPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    const adminEmails = ['goldbenchan@gmail.com', 'kusanokiyoshi1@gmail.com'];
    if (!adminEmails.includes(user.email || '')) {
      router.push('/');
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('column_categories')
      .select('*')
      .order('display_order');
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchColumn = async () => {
    const { data, error } = await supabase
      .from('v2_columns')
      .select('*')
      .eq('id', columnId)
      .single();

    if (error) {
      console.error('コラム取得エラー:', error);
      alert('コラムの取得に失敗しました');
      router.push('/admin/columns');
      return;
    }

    if (data) {
      setTitle(data.title || '');
      setCategoryId(data.category_id || '');
      setContent(data.content || '');
      setSummary(data.summary || '');
      setFeaturedImage(data.featured_image || '');
      setAccessType(data.access_type || 'free');
      setRequiredPoints(data.required_points || 0);
      setIsPublished(data.is_published || false);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!title || !content || !categoryId) {
      alert('タイトル、カテゴリー、本文は必須です');
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('v2_columns')
        .update({
          title,
          category_id: categoryId,
          content,
          summary,
          featured_image: featuredImage || null,
          access_type: accessType,
          required_points: accessType === 'point_required' ? requiredPoints : 0,
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
        })
        .eq('id', columnId);

      if (error) {
        console.error('更新エラー:', error);
        alert(`更新に失敗しました: ${error.message}`);
      } else {
        alert('コラムを更新しました！');
        router.push('/admin/columns');
      }
    } catch (error) {
      console.error('エラー:', error);
      alert('更新に失敗しました');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">コラム編集</h1>
                <p className="mt-1 text-sm text-gray-500">
                  競艇予想コラムを編集します
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* フォーム */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 〇月〇日の競艇予想"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 要約 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              要約（プレビュー用）
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="コラムの概要を150文字程度で入力してください"
            />
          </div>

          {/* アイキャッチ画像 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アイキャッチ画像URL
            </label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {featuredImage && (
              <div className="mt-2">
                <img
                  src={featuredImage}
                  alt="プレビュー"
                  className="max-w-xs rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3E画像エラー%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
          </div>

          {/* アクセスタイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アクセスタイプ
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="free"
                  checked={accessType === 'free'}
                  onChange={(e) => setAccessType(e.target.value as 'free' | 'point_required' | 'line_linked')}
                  className="mr-2"
                />
                無料
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="point_required"
                  checked={accessType === 'point_required'}
                  onChange={(e) => setAccessType(e.target.value as 'free' | 'point_required' | 'line_linked')}
                  className="mr-2"
                />
                ポイント必要
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="line_linked"
                  checked={accessType === 'line_linked'}
                  onChange={(e) => setAccessType(e.target.value as 'free' | 'point_required' | 'line_linked')}
                  className="mr-2"
                />
                LINE連携必須
              </label>
            </div>
          </div>

          {/* 必要ポイント数 */}
          {accessType === 'point_required' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                必要ポイント数
              </label>
              <input
                type="number"
                value={requiredPoints}
                onChange={(e) => setRequiredPoints(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* 本文 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Markdown形式で入力してください"
            />
            <p className="mt-1 text-xs text-gray-500">
              Markdown形式をサポートしています
            </p>
          </div>

          {/* 公開設定 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                公開する
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              チェックを外すと下書きとして保存されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
