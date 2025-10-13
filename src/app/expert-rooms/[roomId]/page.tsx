'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';

interface Room {
  id: string;
  title: string;
  description: string | null;
  required_points: number;
}

interface Message {
  id: string;
  display_name: string;
  message: string;
  avatar_color: string;
  is_anonymous: boolean;
  created_at: string;
  user_email: string;
}

export default function ExpertRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (roomId && session) {
      fetchRoom();
      checkMembership();
      fetchMessages();
      subscribeToMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, session]);

  const fetchRoom = async () => {
    const { data, error } = await supabase
      .from('expert_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('部屋取得エラー:', error);
      router.push('/expert-rooms');
      return;
    }

    setRoom(data);
    setLoading(false);
  };

  const checkMembership = async () => {
    if (!session?.user?.email) return;

    const { data: userData } = await supabase
      .from('v2_users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) return;

    const { data: memberData } = await supabase
      .from('expert_room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userData.id)
      .single();

    setIsJoined(!!memberData);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.email || sending) return;

    setSending(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        user_email: session.user.email,
        display_name: session.user.name || session.user.email.split('@')[0],
        message: newMessage.trim(),
        avatar_color: '#0f62fe',
        is_anonymous: false,
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('送信エラー:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-900">部屋が見つかりませんでした</p>
          <button
            onClick={() => router.push('/expert-rooms')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-900">ログインが必要です</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 pt-32">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 space-y-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
            <p className="text-gray-600">
              {room.description || '入室すると予想家限定のチャットに参加できます。'}
            </p>
            <div className="text-lg">
              <span className="text-blue-600 font-semibold">{room.required_points} pt</span>
              <span className="text-gray-500 ml-2">で入室</span>
            </div>
            <button
              onClick={() => router.push('/expert-rooms')}
              className="px-10 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              一覧に戻って入室する
            </button>
            <p className="text-xs text-gray-500">
              一度入室すれば、今後はポイント消費なしで再入室できます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{room.title}</h1>
            <p className="text-xs text-gray-500">予想家専用チャット</p>
          </div>
        </div>
      </header>

      {/* メッセージエリア */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              まだメッセージがありません
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                  style={{ backgroundColor: msg.avatar_color }}
                >
                  {msg.display_name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {msg.is_anonymous ? '匿名ユーザー' : msg.display_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-800">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* 入力エリア */}
      <footer className="border-t border-gray-200 px-4 py-4 bg-white">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? '送信中...' : '送信'}
          </button>
        </div>
      </footer>
    </div>
  );
}
