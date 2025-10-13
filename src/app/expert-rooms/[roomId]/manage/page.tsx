'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';

interface Participant {
  id: string;
  points_consumed: number;
  joined_at: string;
  user_id: string;
}

interface RoomDetail {
  id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  required_points: number;
  total_members: number;
  is_active: boolean;
  owner_display_name?: string | null;
  owner_user_id?: string | null;
}

export default function ExpertRoomManagePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const roomId = params?.roomId as string;

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    required_points: 0,
    is_active: true,
    owner_display_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!session && status === 'unauthenticated') {
      toast('ログインして利用してください');
      signIn();
    }
  }, [session, status]);

  useEffect(() => {
    if (!roomId || !session) return;

    const fetchRoom = async () => {
      setLoading(true);
      try {
        // 部屋情報取得
        const { data: roomData, error: roomError } = await supabase
          .from('expert_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) throw roomError;

        // ユーザーID取得
        const { data: userData } = await supabase
          .from('v2_users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (!userData) {
          toast.error('ユーザー情報が見つかりません');
          router.push('/expert-rooms');
          return;
        }

        // 所有者チェック
        if (roomData.owner_user_id !== userData.id) {
          // 管理者もOK
          if (!['goldbenchan@gmail.com', 'kusanokiyoshi1@gmail.com'].includes(session.user.email)) {
            toast.error('この部屋の管理権限がありません');
            router.push('/expert-rooms');
            return;
          }
        }

        setRoom(roomData);
        setFormState({
          title: roomData.title,
          description: roomData.description || '',
          cover_image_url: roomData.cover_image_url || '',
          required_points: roomData.required_points,
          is_active: roomData.is_active,
          owner_display_name: roomData.owner_display_name || ''
        });

        // 参加者取得
        const { data: participantsData } = await supabase
          .from('expert_room_members')
          .select('*')
          .eq('room_id', roomId)
          .order('joined_at', { ascending: false });

        setParticipants(participantsData || []);
      } catch (error) {
        console.error(error);
        toast.error('部屋情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, session, router]);

  const handleChange = (field: keyof typeof formState, value: string | number | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!roomId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('expert_rooms')
        .update({
          title: formState.title,
          description: formState.description,
          cover_image_url: formState.cover_image_url,
          required_points: formState.required_points,
          is_active: formState.is_active,
          owner_display_name: formState.owner_display_name
        })
        .eq('id', roomId);

      if (error) throw error;

      toast.success('予想家部屋を更新しました');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!roomId) return;

    if (!confirm('本当にこの予想家部屋を削除しますか？チャットログも閲覧できなくなります。')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('expert_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      toast.success('予想家部屋を削除しました');
      router.push('/expert-rooms');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-16 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-blue-600">予想家部屋の管理</h1>
              <p className="text-sm text-gray-600 mt-2">タイトルや説明文、必要ポイントを編集できます。</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/expert-rooms/${roomId}`)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:border-blue-600"
            >
              チャットに戻る
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {deleting ? '削除中...' : '部屋を削除'}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600">累計参加者</p>
            <p className="text-3xl font-semibold mt-2">{room.total_members || 0}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600">累計消費ポイント</p>
            <p className="text-3xl font-semibold mt-2">
              {participants.reduce((sum, p) => sum + p.points_consumed, 0)} pt
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600">ステータス</p>
            <p className="text-3xl font-semibold mt-2">
              {formState.is_active ? '公開中' : '非公開'}
            </p>
          </div>
        </section>

        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">予想家ニックネーム</label>
            <input
              type="text"
              value={formState.owner_display_name}
              onChange={(e) => handleChange('owner_display_name', e.target.value)}
              placeholder="一覧に表示される名前"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">説明</label>
            <textarea
              value={formState.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">必要ポイント</label>
              <input
                type="number"
                min={0}
                value={formState.required_points}
                onChange={(e) => handleChange('required_points', Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">カバー画像URL</label>
              <input
                type="url"
                value={formState.cover_image_url}
                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formState.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">公開中にする</span>
          </div>
          <div className="text-right pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </section>

        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">参加者一覧</h2>
          {participants.length === 0 ? (
            <p className="text-sm text-gray-600">まだ参加者はいません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-600 text-left">
                  <tr>
                    <th className="py-2">ユーザーID</th>
                    <th className="py-2">消費ポイント</th>
                    <th className="py-2">参加日</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {participants.map((member) => (
                    <tr key={member.id} className="border-t border-gray-200">
                      <td className="py-3">{member.user_id}</td>
                      <td className="py-3">{member.points_consumed} pt</td>
                      <td className="py-3">
                        {new Date(member.joined_at).toLocaleString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
