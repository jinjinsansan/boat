'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase/client';
import { Users, Lock } from 'lucide-react';

interface ExpertRoom {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  required_points: number;
  total_members: number;
  owner_display_name: string | null;
  is_joined?: boolean;
  is_owner?: boolean;
}

export default function ExpertRoomsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<ExpertRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [session]);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 入室済みチェック
      if (session?.user?.email && data) {
        const { data: userData } = await supabase
          .from('v2_users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          const roomsWithStatus = await Promise.all(
            data.map(async (room) => {
              const { data: memberData } = await supabase
                .from('expert_room_members')
                .select('id')
                .eq('room_id', room.id)
                .eq('user_id', userData.id)
                .single();

              return {
                ...room,
                is_joined: !!memberData,
                is_owner: room.owner_user_id === userData.id,
              };
            })
          );
          setRooms(roomsWithStatus);
        } else {
          setRooms(data);
        }
      } else {
        setRooms(data || []);
      }
    } catch (error) {
      console.error('部屋取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (room: ExpertRoom) => {
    if (!session) {
      alert('ログインが必要です');
      router.push('/auth/signin');
      return;
    }

    setJoiningRoomId(room.id);

    try {
      // ユーザーID取得
      const { data: userData } = await supabase
        .from('v2_users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (!userData) {
        alert('ユーザー情報が見つかりません');
        return;
      }

      // 既に入室済みかチェック
      const { data: existingMember } = await supabase
        .from('expert_room_members')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', userData.id)
        .single();

      if (existingMember) {
        // 既に入室済み
        router.push(`/expert-rooms/${room.id}`);
        return;
      }

      // ポイント消費処理（TODO: バックエンドAPIで実装）
      // 現時点では入室記録のみ作成
      const { error: joinError } = await supabase
        .from('expert_room_members')
        .insert({
          room_id: room.id,
          user_id: userData.id,
          points_consumed: room.required_points,
        });

      if (joinError) throw joinError;

      // メンバー数をインクリメント
      await supabase.rpc('increment_room_member_count', { p_room_id: room.id });

      alert(`${room.required_points}ポイントを消費して入室しました`);
      router.push(`/expert-rooms/${room.id}`);
    } catch (error) {
      console.error('入室エラー:', error);
      alert('入室に失敗しました');
    } finally {
      setJoiningRoomId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">予想家部屋</h1>
          <p className="text-gray-600">
            予想家が運営する専用オープンチャット。一度ポイントで入室すれば、いつでも再入室が可能です。
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-64 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">公開中の予想家部屋はまだありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden"
              >
                {room.cover_image_url ? (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${room.cover_image_url})` }}
                  />
                ) : (
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
                    <Users className="w-16 h-16 text-blue-300" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="uppercase tracking-wider">Expert Room</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.total_members}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {room.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {room.description || '詳細はオープンチャット内でご確認ください。'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-blue-600 flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      {room.required_points} pt
                    </span>
                    <span className="text-gray-500">{room.owner_display_name || '予想家'}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (room.is_joined || room.is_owner) {
                        router.push(`/expert-rooms/${room.id}`);
                      } else {
                        handleJoin(room);
                      }
                    }}
                    disabled={joiningRoomId === room.id}
                    className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {room.is_owner
                      ? '部屋を管理'
                      : room.is_joined
                        ? '再入室'
                        : joiningRoomId === room.id
                          ? '入室処理中...'
                          : `${room.required_points}ptで入室`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
