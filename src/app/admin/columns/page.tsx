'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Column {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
  };
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  view_count: number;
  display_order?: number;
  access_type: string;
  required_points: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminColumnsPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPermission();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const checkPermission = async () => {
    // 簡易的な管理者チェック（実際は適切な認証を実装）
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

  const fetchColumns = async () => {
    setLoading(true);
    let query = supabase
      .from('v2_columns')
      .select(`
        id,
        title,
        is_published,
        published_at,
        created_at,
        view_count,
        display_order,
        access_type,
        required_points,
        category:column_categories(id, name)
      `)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      const mappedData = data.map((item: { category?: unknown; [key: string]: unknown }) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category
      }));
      setColumns(mappedData);
    }
    setLoading(false);
  };

  const togglePublish = async (columnId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('v2_columns')
      .update({
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', columnId);

    if (!error) {
      fetchColumns();
    } else {
      alert('更新に失敗しました');
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (!confirm('このコラムを削除してもよろしいですか？')) {
      return;
    }

    const { error } = await supabase
      .from('v2_columns')
      .delete()
      .eq('id', columnId);

    if (!error) {
      fetchColumns();
    } else {
      alert('削除に失敗しました');
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...columns];
    [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
    setColumns(newColumns);
    setOrderChanged(true);
  };

  const moveDown = (index: number) => {
    if (index === columns.length - 1) return;
    const newColumns = [...columns];
    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    setColumns(newColumns);
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const updates = columns.map((column, index) => ({
        id: column.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('v2_columns')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      setOrderChanged(false);
      alert('表示順序を保存しました');
    } catch (error) {
      console.error('順序の保存に失敗しました:', error);
      alert('順序の保存に失敗しました');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">コラム管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                競艇予想コラムの作成・編集・公開管理
              </p>
            </div>
            <Link
              href="/admin/columns/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新規作成
            </Link>
          </div>

          {/* カテゴリフィルター */}
          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              すべて
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* コラム一覧 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orderChanged && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-yellow-800">
              表示順序が変更されています。保存してください。
            </p>
            <button
              onClick={saveOrder}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  順序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクセス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  閲覧数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {columns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    コラムがありません。「新規作成」ボタンから作成してください。
                  </td>
                </tr>
              ) : (
                columns.map((column, index) => (
                  <tr key={column.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === columns.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <span className="ml-2 text-sm text-gray-500">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {column.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {column.category?.name || '未分類'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.access_type === 'free' && '無料'}
                      {column.access_type === 'point_required' && `${column.required_points}pt`}
                      {column.access_type === 'line_linked' && 'LINE連携'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.view_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublish(column.id, column.is_published)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          column.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {column.is_published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            公開中
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            非公開
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(column.created_at), 'yyyy/MM/dd', { locale: ja })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/columns/${column.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteColumn(column.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
