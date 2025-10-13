import { useEffect, useState, useCallback, useRef } from 'react';
// RealtimeChannel type from supabase-js to avoid type conflicts
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

export interface ChatMessage {
  id: string;
  user_email: string;
  display_name: string;
  message: string;
  avatar_color?: string;
  is_anonymous: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  reactions?: ChatReaction[];
  reply_to_id?: string;
  room_id?: string | null;
  reply_to?: {
    id: string;
    display_name: string;
    message: string;
    is_anonymous: boolean;
  };
}

export interface ChatReaction {
  id: string;
  message_id: string;
  user_email: string;
  emoji: string;
  created_at: string;
}

export interface ChatProfile {
  user_email: string;
  default_nickname?: string;
  avatar_url?: string;
  is_blocked: boolean;
  blocked_until?: string;
}

export interface OnlineUser {
  email: string;
  displayName: string;
  isAnonymous: boolean;
}

export interface UseRealtimeChatOptions {
  roomId?: string | null;
}

export function useRealtimeChat(options: UseRealtimeChatOptions = {}) {
  const { roomId: providedRoomId = null } = options;
  const roomId = providedRoomId ?? null;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [currentUserSettings, setCurrentUserSettings] = useState({ displayName: '', isAnonymous: false });
  const channelRef = useRef<any | null>(null);
  const presenceRef = useRef<any | null>(null);
  const isSubscribedRef = useRef(false); // StrictMode対策

  // 初期メッセージ取得
  const fetchMessages = useCallback(async (limit = 50, before?: string) => {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      if (roomId) {
        query = query.eq('room_id', roomId);
      } else {
        query = query.is('room_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // reply_to_idがあるメッセージに対して、返信先データを取得
        const messagesWithReplies = await Promise.all(
          data.map(async (msg) => {
            let reply_to = null;
            if (msg.reply_to_id) {
              const { data: replyData } = await supabase
                .from('chat_messages')
                .select('id, message, display_name, is_anonymous')
                .eq('id', msg.reply_to_id)
                .single();

              if (replyData) {
                reply_to = replyData;
              }
            }

            return {
              ...msg,
              reactions: msg.reactions || [],
              reply_to
            } as ChatMessage;
          })
        );

        if (before) {
          // 古いメッセージを先頭に追加（古い順）
          setMessages(prev => [...messagesWithReplies.reverse(), ...prev]);
        } else {
          // 初期ロード時は古い順に並べる
          setMessages(messagesWithReplies.reverse());
        }

        if (data.length < limit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('メッセージの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // メッセージ送信
  const sendMessage = useCallback(async (
    message: string,
    displayName: string,
    isAnonymous: boolean = false,
    avatarColor?: string,
    replyToId?: string
  ) => {
    if (!session?.user?.email) {
      toast.error('ログインが必要です');
      return false;
    }

    setSending(true);

    try {
      const messageData: any = {
        user_email: session.user.email,
        display_name: isAnonymous ? `匿名ユーザー${Math.floor(Math.random() * 1000)}` : displayName,
        message: message.trim(),
        avatar_color: avatarColor || '#0f62fe',
        is_anonymous: isAnonymous,
        is_deleted: false
      };

      messageData.room_id = roomId;

      if (replyToId) {
        messageData.reply_to_id = replyToId;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      // 楽観的更新: 即座に表示（リアルタイムイベントでの重複は後でチェック）
      if (data && data[0]) {
        console.log('Message sent successfully:', data[0].id);

        // リプライ先のメッセージデータを取得
        let replyToMessage = null;
        if (replyToId) {
          const replyMessage = messages.find(m => m.id === replyToId);
          if (replyMessage) {
            replyToMessage = {
              id: replyMessage.id,
              user_email: replyMessage.user_email,
              display_name: replyMessage.display_name,
              message: replyMessage.message,
              is_anonymous: replyMessage.is_anonymous
            };
          }
        }

        // 送信者自身のメッセージは即座に追加（UX向上）
        const newMessage = {
          ...data[0],
          reactions: [],
          reply_to: replyToMessage
        } as unknown as ChatMessage;

        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) {
            console.log('Message already exists locally, skipping');
            return prev;
          }
          return [...prev, newMessage];
        });
      }

      return true;
    } catch (error: any) {
      console.error('Failed to send message:', error);

      if (error.message?.includes('blocked')) {
        toast.error('あなたはブロックされています');
      } else {
        // エラーの詳細を表示（デバッグ用）
        const errorMessage = error.message || 'メッセージの送信に失敗しました';
        console.error('Error details:', errorMessage);
        toast.error(errorMessage);
      }

      return false;
    } finally {
      setSending(false);
    }
  }, [session, messages, roomId]);

  // メッセージ削除（管理者用）
  const deleteMessage = useCallback(async (messageId: string) => {
    console.log('deleteMessage called:', { messageId, userEmail: session?.user?.email });

    if (!session?.user?.email) {
      console.error('No user session for delete');
      toast.error('ログインが必要です');
      return false;
    }

    try {
      console.log('Attempting to delete message:', messageId);

      const { data, error } = await supabase
        .from('chat_messages')
        .update({
          is_deleted: true
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Message deleted successfully:', data);

      // ローカル状態からメッセージを即座に削除
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== messageId);
        console.log(`Messages before: ${prev.length}, after: ${filtered.length}`);
        return filtered;
      });

      return true;
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      toast.error(error.message || '削除に失敗しました');
      return false;
    }
  }, [session]);

  // リアクション追加/削除
  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    console.log('toggleReaction called:', { messageId, emoji, userEmail: session?.user?.email });

    if (!session?.user?.email) {
      console.error('No user session');
      toast.error('ログインが必要です');
      return false;
    }

    try {
      // 既存のリアクションをチェック
      console.log('Checking existing reactions...');
      // まず全てのユーザーのリアクションを取得してから絵文字でフィルタ
      const { data: reactions, error: checkError } = await supabase
        .from('chat_reactions')
        .select('id, emoji')
        .eq('message_id', messageId)
        .eq('user_email', session.user.email);

      // 絵文字の比較をJavaScript側で行う（URLエンコード問題を回避）
      const existing = reactions?.find(r => r.emoji === emoji);

      if (checkError) {
        console.error('Error checking existing reaction:', checkError);
        // エラーがあってもリアクション追加を試みる
      }

      if (existing) {
        // 削除
        console.log('Deleting reaction:', existing.id);
        const { error } = await supabase
          .from('chat_reactions')
          .delete()
          .eq('id', existing.id as string);

        if (error) {
          console.error('Error deleting reaction:', error);
          throw error;
        }

        // ローカル状態を即座に更新
        setMessages(prev => prev.map(m => {
          if (m.id === messageId) {
            const reactions = (m.reactions || []).filter(
              r => !(r.user_email === session.user?.email && r.emoji === emoji)
            );
            return { ...m, reactions };
          }
          return m;
        }));
      } else {
        // 追加
        console.log('Adding reaction...');
        const { data: newReaction, error } = await supabase
          .from('chat_reactions')
          .insert({
            message_id: messageId,
            user_email: session.user.email,
            emoji
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding reaction:', error);
          throw error;
        }

        console.log('Reaction added successfully:', newReaction);

        // ローカル状態を即座に更新
        setMessages(prev => prev.map(m => {
          if (m.id === messageId) {
            // 同じユーザーの同じ絵文字のリアクションが既に存在しないか確認
            const existingReactions = m.reactions || [];
            const isDuplicate = existingReactions.some(
              r => r.user_email === session.user?.email && r.emoji === emoji
            );
            if (!isDuplicate) {
              const reactions = [...existingReactions, newReaction as unknown as ChatReaction];
              return { ...m, reactions };
            }
            console.log('Duplicate reaction detected, skipping local update');
            return m;
          }
          return m;
        }));
      }

      return true;
    } catch (error: any) {
      console.error('Failed to toggle reaction:', error);
      toast.error(error.message || 'リアクションの更新に失敗しました');
      return false;
    }
  }, [session]);

  // Realtime設定
  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    setLoading(true);
    isSubscribedRef.current = false;

    // 初期データ取得（直接実行）
    const loadInitialMessages = async () => {
      try {
        let initialQuery = supabase
          .from('chat_messages')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (roomId) {
          initialQuery = initialQuery.eq('room_id', roomId);
        } else {
          initialQuery = initialQuery.is('room_id', null);
        }

        const { data, error } = await initialQuery;

        if (error) throw error;

        if (data) {
          // reply_to_idがあるメッセージに対して、返信先データを取得
          const messagesWithReplies = await Promise.all(
            data.map(async (msg) => {
              let reply_to = null;
              if (msg.reply_to_id) {
                const { data: replyData } = await supabase
                  .from('chat_messages')
                  .select('id, message, display_name, is_anonymous')
                  .eq('id', msg.reply_to_id)
                  .single();

                if (replyData) {
                  reply_to = replyData;
                }
              }

              return {
                ...msg,
                reactions: msg.reactions || [],
                reply_to
              } as ChatMessage;
            })
          );

          // 初期ロード時は古い順に並べる
          setMessages(messagesWithReplies.reverse());

          if (data.length < 50) {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('メッセージの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();

    // 既存のチャンネルをクリーンアップ
    if (channelRef.current) {
      console.log('Cleaning up existing channel...');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // メッセージのリアルタイム購読
    console.log('Setting up realtime subscription...');
    channelRef.current = supabase.channel('chat_messages_' + Date.now()) // ユニークなチャンネル名を使用
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          console.log('Realtime INSERT event received:', payload);
          const newMessage = payload.new as ChatMessage;

          // reactionsは空配列で初期化
          newMessage.reactions = [];

          if ((roomId && newMessage.room_id !== roomId) || (!roomId && newMessage.room_id)) {
            console.log('Skipping message for different room:', newMessage.room_id);
            return;
          }

          // reply_to_idがある場合は、そのメッセージを取得
          if (newMessage.reply_to_id) {
            const { data: replyToData } = await supabase
              .from('chat_messages')
              .select('id, message, display_name, is_anonymous')
              .eq('id', newMessage.reply_to_id)
              .single();

            if (replyToData) {
              newMessage.reply_to = {
                id: replyToData.id as string,
                display_name: replyToData.display_name as string,
                message: replyToData.message as string,
                is_anonymous: replyToData.is_anonymous as boolean
              };
              console.log('Fetched reply_to data:', newMessage.reply_to);
            }
          }

          // 新しいメッセージを最後に追加（既に存在する場合はスキップ）
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) {
              console.log('Message already exists (from optimistic update), skipping:', newMessage.id);
              return prev;
            }
            console.log('Adding new message from realtime:', newMessage.id);
            // リアルタイムで受信したメッセージを追加
            return [...prev, newMessage];
          });

          // 新着メッセージ通知（タブが非表示の場合）
          if (document.hidden && payload.new.user_email !== session?.user?.email) {
            const unreadCount = parseInt(document.title.match(/\((\d+)\)/)?.[1] || '0') + 1;
            document.title = `(${unreadCount}) 競艇予想AI D-logicBoat`;
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          if ((roomId && updatedMessage.room_id !== roomId) || (!roomId && updatedMessage.room_id)) {
            return;
          }
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(m => m.id !== updatedMessage.id));
          } else {
            // メッセージを更新
            setMessages(prev => prev.map(m =>
              m.id === updatedMessage.id ? updatedMessage : m
            ));
          }
        }
      )
      .subscribe((status) => {
        console.log('Chat messages channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to chat messages channel');
          isSubscribedRef.current = true; // 購読済みフラグをセット
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to chat messages channel');
          setConnectionStatus('error');
        } else if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
          setConnectionStatus('error');
        } else if (status === 'CLOSED') {
          console.error('Channel was closed');
        }
      });

    // リアクションのリアルタイム購読（効率化）
    const reactionChannel = supabase.channel('chat_reactions_' + Date.now()) // ユニークなチャンネル名を使用
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_reactions' },
        async (payload) => {
          const newReaction = payload.new as ChatReaction;

          // 自分が追加したリアクションは既にローカルで追加済みなのでスキップ
          if (newReaction.user_email === session?.user?.email) {
            console.log('Skipping own reaction from realtime (already added locally)');
            return;
          }

          // 他のユーザーのリアクションのみ追加
          setMessages(prev => prev.map(m => {
            if (m.id === newReaction.message_id) {
              // 既に同じリアクションが存在しないか確認
              const existingReaction = m.reactions?.find(
                r => r.user_email === newReaction.user_email && r.emoji === newReaction.emoji
              );

              if (!existingReaction) {
                const reactions = [...(m.reactions || []), newReaction];
                return { ...m, reactions };
              }
            }
            return m;
          }));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_reactions' },
        async (payload) => {
          const deletedReaction = payload.old as ChatReaction;

          // 自分が削除したリアクションは既にローカルで削除済みなのでスキップ
          if (deletedReaction.user_email === session?.user?.email) {
            console.log('Skipping own reaction deletion from realtime (already removed locally)');
            return;
          }

          // 他のユーザーのリアクション削除のみ反映
          setMessages(prev => prev.map(m => {
            if (m.id === deletedReaction.message_id) {
              const reactions = (m.reactions || []).filter(
                r => r.id !== deletedReaction.id
              );
              return { ...m, reactions };
            }
            return m;
          }));
        }
      )
      .subscribe();

    // Presence（オンラインユーザー）
    if (presenceRef.current) {
      console.log('Unsubscribing from existing presence channel...');
      presenceRef.current.unsubscribe();
      presenceRef.current = null;
    }

    // 部屋ごとにプレゼンスチャンネルを切り替える
    const presenceKey = session?.user?.email || `anonymous_${Math.random().toString(36).substr(2, 9)}`;
    const presenceChannelName = roomId ? `online_users_${roomId}` : 'online_users';

    presenceRef.current = supabase.channel(presenceChannelName, {
      config: {
        presence: { key: presenceKey } // メールアドレスでプレゼンスを管理（重複防止）
      }
    })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceRef.current?.presenceState();
        console.log('Presence state:', state); // デバッグ用
        if (state) {
          const users = Object.values(state).flat().map((u: any) => ({
            email: u.user_email,
            displayName: u.display_name || u.user_email.split('@')[0],
            isAnonymous: u.is_anonymous || false
          }));
          console.log('Online users count:', users.length, users); // デバッグ用
          setOnlineUsers(users);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && session?.user?.email) {
          await presenceRef.current?.track({
            user_email: session.user.email,
            display_name: session.user.email.split('@')[0],
            is_anonymous: false, // デフォルトは非匿名
            online_at: new Date().toISOString()
          });
        }
      });

    // タブがアクティブになったら未読数をリセット
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title = '競艇予想AI D-logicBoat';
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // クリーンアップ
    return () => {
      console.log('Cleaning up realtime subscriptions...');
      isSubscribedRef.current = false; // 購読フラグをリセット
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (reactionChannel) {
        reactionChannel.unsubscribe();
      }
      if (presenceRef.current) {
        presenceRef.current.unsubscribe();
        presenceRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, roomId]); // fetchMessagesを依存配列から削除（無限ループ防止）

  // もっと読み込む
  const loadMore = useCallback(() => {
    if (messages.length > 0 && hasMore) {
      const oldestMessage = messages[0];
      fetchMessages(50, oldestMessage.created_at);
    }
  }, [messages, hasMore, fetchMessages]);

  // オンラインステータスを更新（表示名や匿名設定が変更された時）
  const updatePresence = useCallback(async (displayName: string, isAnonymous: boolean) => {
    if (presenceRef.current && session?.user?.email) {
      setCurrentUserSettings({ displayName, isAnonymous });
      await presenceRef.current?.track({
        user_email: session.user.email,
        display_name: isAnonymous ? `匿名ユーザー${Math.floor(Math.random() * 1000)}` : displayName,
        is_anonymous: isAnonymous,
        online_at: new Date().toISOString()
      });
    }
  }, [session]);

  return {
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
  };
}
