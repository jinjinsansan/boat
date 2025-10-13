'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FileText } from 'lucide-react';

interface Column {
  id: string;
  title: string;
  published_at: string;
  view_count: number;
  category: {
    name: string;
  };
}

export function ColumnsPreview() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    const { data, error } = await supabase
      .from('v2_columns')
      .select(`
        id,
        title,
        published_at,
        view_count,
        category:column_categories(name)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(6);

    if (!error && data) {
      const mappedData = data.map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category
      }));
      setColumns(mappedData);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
          <div className="text-center text-gray-500">読み込み中...</div>
        </div>
      </section>
    );
  }

  if (columns.length === 0) {
    return null; // コラムがない場合は非表示
  }

  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <div className="space-y-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#3dd6d0]">
            Columns & Insights
          </span>
          <h2 className="text-3xl font-semibold text-[#0b1533]">
            競艇予想コラム
          </h2>
          <p className="text-sm text-[#4f5d7a]">
            最新の競艇予想コラムをお届けします
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <Link
              key={column.id}
              href={`/column/${column.id}`}
              className="group rounded-[20px] border border-[#e5ecfb] bg-[#f9fbff] p-6 shadow-[0_10px_30px_rgba(11,21,51,0.05)] transition-all hover:shadow-[0_20px_50px_rgba(11,21,51,0.12)]"
            >
              <div className="mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3dd6d0]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3dd6d0]">
                  {column.category?.name || 'コラム'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#0b1533] group-hover:text-[#0f62fe] transition-colors line-clamp-2 mb-3">
                {column.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-[#6c7a99]">
                <span>
                  {format(new Date(column.published_at), 'yyyy/MM/dd', { locale: ja })}
                </span>
                <span>👁 {column.view_count.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/column"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f62fe] text-white font-semibold rounded-full hover:bg-[#0353e9] transition-colors shadow-[0_10px_30px_rgba(15,98,254,0.25)]"
          >
            すべてのコラムを見る
          </Link>
        </div>
      </div>
    </section>
  );
}
