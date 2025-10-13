'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { FileText, Eye, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Column {
  id: string;
  title: string;
  summary: string;
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ColumnListPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

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
        summary,
        featured_image,
        access_type,
        required_points,
        published_at,
        view_count,
        category:column_categories(id, name)
      `)
      .eq('is_published', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false });

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

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="border-b bg-gradient-to-r from-[#0a1628] to-[#162840]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">競艇予想コラム</h1>
          </div>
          <p className="text-blue-100">
            競艇レースの予想やデータ分析に関する専門コラムをご覧いただけます
          </p>
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : columns.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">コラムがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {columns.map((column) => (
              <Link
                key={column.id}
                href={`/column/${column.id}`}
                className="group bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* アイキャッチ画像 */}
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                  {column.featured_image ? (
                    <img
                      src={column.featured_image}
                      alt={column.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="w-16 h-16 text-blue-300" />
                    </div>
                  )}
                  
                  {/* アクセスタイプバッジ */}
                  <div className="absolute top-3 right-3">
                    {column.access_type === 'free' && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                        無料
                      </span>
                    )}
                    {column.access_type === 'point_required' && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {column.required_points}pt
                      </span>
                    )}
                    {column.access_type === 'line_linked' && (
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded">
                        LINE連携
                      </span>
                    )}
                  </div>
                </div>

                {/* コンテンツ */}
                <div className="p-4">
                  {/* カテゴリ */}
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      {column.category?.name || '未分類'}
                    </span>
                  </div>

                  {/* タイトル */}
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {column.title}
                  </h2>

                  {/* 要約 */}
                  {column.summary && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {column.summary}
                    </p>
                  )}

                  {/* メタ情報 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {format(new Date(column.published_at), 'yyyy/MM/dd', { locale: ja })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {column.view_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
