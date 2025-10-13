import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ChatMessage } from '@/hooks/useRealtimeChat';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: ChatMessage) => void;
  currentUserEmail: string;
  currentAvatarColor?: string;
  isAdmin: boolean;
  scrollAreaRef?: React.RefObject<HTMLDivElement>;
  roomOwnerEmail?: string | null;
  bottomInset?: number;
}

export default function OpenChatMessageList({
  messages,
  loading,
  hasMore,
  onLoadMore,
  onDelete,
  onReaction,
  onReply,
  currentUserEmail,
  currentAvatarColor = '#0f62fe',
  isAdmin,
  scrollAreaRef: externalScrollAreaRef,
  roomOwnerEmail,
  bottomInset = 0
}: MessageListProps) {
  const internalScrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = externalScrollAreaRef || internalScrollAreaRef;
  const bottomMarkerRef = useRef<HTMLDivElement | null>(null);

  const autoScrollRef = useRef(true);
  const previousMessageCount = useRef(messages.length);
  const isInitialLoad = useRef(true);
  const previousFirstMessageRef = useRef<string | null>(null);
  const previousScrollHeightRef = useRef<number>(0);

  // 手動スクロール関数
  const scrollToBottom = useCallback(() => {
    const container = scrollAreaRef.current;
    
    if (!container) {
      console.log('[SCROLL] No container element');
      return;
    }

    const targetScrollTop = container.scrollHeight - container.clientHeight;
    
    if (Math.abs(targetScrollTop - container.scrollTop) > 10) {
      console.log('[SCROLL] Scrolling to bottom:', {
        currentScrollTop: container.scrollTop,
        targetScrollTop,
        distance: targetScrollTop - container.scrollTop
      });
    }
    
    requestAnimationFrame(() => {
      container.scrollTop = targetScrollTop;
    });
  }, [bottomInset, scrollAreaRef]);

  // 初回ロード時のスクロール
  useLayoutEffect(() => {
    if (!loading && messages.length > 0 && isInitialLoad.current) {
      console.log('[SCROLL] Initial load, messages:', messages.length, 'bottomInset:', bottomInset);
      isInitialLoad.current = false;
      
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, messages.length, bottomInset, scrollToBottom]);

  // 新しいメッセージ追加時のスクロール
  useEffect(() => {
    if (messages.length === 0) {
      previousMessageCount.current = 0;
      return;
    }

    const messageCountIncreased = messages.length > previousMessageCount.current;
    console.log('[SCROLL] Message count check:', {
      current: messages.length,
      previous: previousMessageCount.current,
      increased: messageCountIncreased,
      autoScroll: autoScrollRef.current
    });

    if (messageCountIncreased && autoScrollRef.current && !isInitialLoad.current) {
      scrollToBottom();
    }

    previousMessageCount.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // bottomInset変更時のスクロール
  useEffect(() => {
    if (!isInitialLoad.current && autoScrollRef.current && bottomInset > 0) {
      const timeoutId = setTimeout(() => scrollToBottom(), 50);
      return () => clearTimeout(timeoutId);
    }
  }, [bottomInset, scrollToBottom]);

  // 過去ログ読み込み時のスクロール位置維持
  useLayoutEffect(() => {
    const container = scrollAreaRef.current;
    if (!container || messages.length === 0) {
      previousFirstMessageRef.current = null;
      previousScrollHeightRef.current = container?.scrollHeight || 0;
      return;
    }

    const currentFirstId = messages[0]?.id ?? null;
    const previousFirstId = previousFirstMessageRef.current;
    const previousScrollHeight = previousScrollHeightRef.current;
    const newScrollHeight = container.scrollHeight;

    if (
      previousFirstId &&
      currentFirstId &&
      currentFirstId !== previousFirstId &&
      container.scrollTop < 50
    ) {
      const heightDiff = newScrollHeight - previousScrollHeight;
      if (heightDiff > 0) {
        container.scrollTop = heightDiff + container.scrollTop;
      }
    }

    previousFirstMessageRef.current = currentFirstId;
    previousScrollHeightRef.current = newScrollHeight;
  }, [messages, scrollAreaRef]);

  // スクロール位置監視
  const handleScroll = useCallback(() => {
    const container = scrollAreaRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 200;
    
    autoScrollRef.current = isAtBottom;
  }, [scrollAreaRef]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-gray-600">メッセージを読み込み中...</div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600">まだメッセージがありません</p>
          <p className="text-sm text-gray-500 mt-2">最初のメッセージを送ってみましょう！</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollAreaRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto overflow-x-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        scrollbarWidth: 'auto',
        scrollbarColor: '#e5e7eb #ffffff',
        paddingBottom: `${bottomInset}px`
      }}
      id="scrollableDiv"
    >
      <InfiniteScroll
        dataLength={messages.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={
          <div className="text-center py-4">
            <span className="text-gray-600">読み込み中...</span>
          </div>
        }
        scrollableTarget="scrollableDiv"
        inverse={false}
        className="flex flex-col pt-4"
      >
        {messages.map((message) => {
          const isOwnMessage = message.user_email?.toLowerCase() === currentUserEmail?.toLowerCase();

          return (
            <div key={message.id} id={`message-${message.id}`}>
              <MessageItem
                message={message}
                onDelete={onDelete}
                onReaction={onReaction}
                onReply={onReply}
                currentUserEmail={currentUserEmail}
                currentAvatarColor={currentAvatarColor}
                isAdmin={isAdmin}
                isOwnMessage={isOwnMessage}
                roomOwnerEmail={roomOwnerEmail}
              />
            </div>
          );
        })}
        {/* 最下部マーカー */}
        <div
          ref={bottomMarkerRef}
          data-bottom-anchor="true"
          style={{ height: 0, flexShrink: 0 }}
          className="w-0"
        />
      </InfiniteScroll>
    </div>
  );
}
