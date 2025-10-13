'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import OpenChatMessageList from '@/components/chat/OpenChatMessageList';
import OpenChatMessageInput from '@/components/chat/OpenChatMessageInput';
import ScrollToBottomButton from '@/components/chat/ScrollToBottomButton';
import { useRealtimeChat, ChatMessage } from '@/hooks/useRealtimeChat';
import { ArrowLeft, X } from 'lucide-react';

interface RoomDetailResponse {
  id: string;
  title: string;
  description?: string | null;
  required_points: number;
  owner_user_id?: string | null;
  owner_display_name?: string | null;
  is_active: boolean;
}

export default function ExpertRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const roomId = params?.roomId as string;
  const [roomState, setRoomState] = useState<RoomDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const fetchRoom = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('expert_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      setRoomState(data);

      // 入室チェック
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from('v2_users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          const { data: memberData } = await supabase
            .from('expert_room_members')
            .select('id')
            .eq('room_id', roomId)
            .eq('user_id', userData.id)
            .single();

          setIsJoined(!!memberData);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('部屋情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [roomId, session]);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId, fetchRoom]);

  const handleJoin = async () => {
    if (!session) {
      toast('ログインして利用してください');
      signIn();
      return;
    }

    setJoining(true);
    try {
      const { data: userData } = await supabase
        .from('v2_users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (!userData) {
        toast.error('ユーザー情報が見つかりません');
        return;
      }

      // 既に入室済みかチェック
      const { data: existingMember } = await supabase
        .from('expert_room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userData.id)
        .single();

      if (existingMember) {
        setIsJoined(true);
        toast.success('入室済みです');
        return;
      }

      // 入室記録を作成
      const { error: joinError } = await supabase
        .from('expert_room_members')
        .insert({
          room_id: roomId,
          user_id: userData.id,
          points_consumed: roomState?.required_points || 0,
        });

      if (joinError) throw joinError;

      // メンバー数をインクリメント
      await supabase.rpc('increment_room_member_count', { p_room_id: roomId });

      toast.success(`${roomState?.required_points || 0}ポイントを消費して入室しました`);
      await fetchRoom();
    } catch (error) {
      console.error(error);
      toast.error('入室処理でエラーが発生しました');
    } finally {
      setJoining(false);
    }
  };

  if (!roomId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-xl text-blue-600">予想家部屋が見つかりませんでした。</p>
            <button
              onClick={() => router.push('/expert-rooms')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 pt-32">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 space-y-6 text-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 mb-2">{roomState.title}</h1>
              <p className="text-sm text-gray-600">
                {roomState.description || '入室すると予想家限定のチャットに参加できます。'}
              </p>
            </div>
            <div className="text-lg">
              <span className="text-blue-700 font-semibold">{roomState.required_points} pt</span>
              <span className="text-gray-600 ml-2">で入室</span>
            </div>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-10 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {joining ? '入室処理中...' : 'ポイントを消費して入室する'}
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
    <ExpertRoomChat
      roomId={roomId}
      roomTitle={roomState.title}
      ownerEmail={null}
    />
  );
}

function ExpertRoomChat({
  roomId,
  roomTitle,
  ownerEmail
}: {
  roomId: string;
  roomTitle: string;
  ownerEmail: string | null;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    messages,
    loading,
    sending,
    hasMore,
    onlineUsers,
    connectionStatus,
    sendMessage,
    deleteMessage,
    toggleReaction,
    loadMore,
    updatePresence
  } = useRealtimeChat({ roomId });

  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [avatarColor, setAvatarColor] = useState('#0f62fe');
  const [lockDisplayName, setLockDisplayName] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 初期化：localStorageから表示名を復元
  useEffect(() => {
    if (session?.user?.email) {
      const savedDisplayName = localStorage.getItem(`expert_room_display_name_${roomId}`);
      const savedLockStatus = localStorage.getItem(`expert_room_lock_display_name_${roomId}`) === 'true';

      if (savedDisplayName && savedLockStatus) {
        setDisplayName(savedDisplayName);
        setLockDisplayName(true);
      } else {
        setDisplayName(session.user.email.split('@')[0]);
      }
    }
  }, [session, roomId]);

  useEffect(() => {
    if (displayName) {
      updatePresence(displayName, isAnonymous);
    }
  }, [displayName, isAnonymous, updatePresence]);

  const userEmail = session?.user?.email ?? null;
  const isAdmin = userEmail ? ['goldbenchan@gmail.com', 'kusanokiyoshi1@gmail.com'].includes(userEmail) : false;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
          <p className="text-xl">ログインが必要です</p>
          <button
            onClick={() => signIn()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 bg-white flex flex-col">
        <header className="border-b border-gray-200 px-4 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-blue-600">{roomTitle}</h1>
                <p className="text-xs text-gray-500">予想家専用チャット</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs ${
              connectionStatus === 'connected'
                ? 'bg-green-100 text-green-600'
                : connectionStatus === 'error'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-yellow-100 text-yellow-600'
            }`}>
              {connectionStatus === 'connected'
                ? '接続済み'
                : connectionStatus === 'error'
                  ? '接続エラー'
                  : '接続中...'}
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0">
          <OpenChatMessageList
            messages={messages}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onDelete={deleteMessage}
            onReaction={toggleReaction}
            onReply={setReplyTo}
            currentUserEmail={userEmail ?? ''}
            currentAvatarColor={avatarColor}
            isAdmin={Boolean(isAdmin)}
            scrollAreaRef={scrollAreaRef}
            roomOwnerEmail={ownerEmail}
          />
        </main>

        <footer className="border-t border-gray-200 px-4 py-4 flex-shrink-0 bg-white">
          {replyTo && (
            <div className="bg-gray-100 rounded-lg p-2 mb-2 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-1">
                  {replyTo.is_anonymous ? '匿名ユーザー' : replyTo.display_name}への返信
                </p>
                <p className="text-xs text-gray-800 truncate">{replyTo.message}</p>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="p-1 text-gray-600 hover:text-gray-900 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <OpenChatMessageInput
            onSend={(message) => {
              sendMessage(message, displayName, isAnonymous, avatarColor, replyTo?.id);
              setReplyTo(null);
            }}
            sending={sending}
            placeholder={
              replyTo
                ? `${replyTo.display_name}に返信...`
                : isAnonymous
                  ? '匿名で投稿...'
                  : `${displayName}として投稿...`
            }
            displayName={displayName}
            isAnonymous={isAnonymous}
            avatarColor={avatarColor}
            lockDisplayName={lockDisplayName}
            onDisplayNameChange={(name) => {
              setDisplayName(name);
              if (lockDisplayName) {
                localStorage.setItem(`expert_room_display_name_${roomId}`, name);
              }
            }}
            onAnonymousChange={setIsAnonymous}
            onAvatarColorChange={setAvatarColor}
            onLockDisplayNameChange={(locked) => {
              setLockDisplayName(locked);
              localStorage.setItem(`expert_room_lock_display_name_${roomId}`, locked.toString());
              if (locked) {
                localStorage.setItem(`expert_room_display_name_${roomId}`, displayName);
              } else {
                localStorage.removeItem(`expert_room_display_name_${roomId}`);
              }
            }}
            onlineUsers={onlineUsers}
          />
        </footer>
      </div>
      <ScrollToBottomButton targetRef={scrollAreaRef} />
    </div>
  );
}
