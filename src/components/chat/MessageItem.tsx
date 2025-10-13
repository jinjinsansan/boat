import React from 'react';
import { ChatMessage } from '@/hooks/useRealtimeChat';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { Trash2, Flag, Copy, Reply, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

dayjs.locale('ja');

interface MessageItemProps {
  message: ChatMessage;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: ChatMessage) => void;
  currentUserEmail: string;
  currentAvatarColor?: string;
  isAdmin: boolean;
  isOwnMessage: boolean;
  roomOwnerEmail?: string | null;
}

const reactionEmojis = ['👍', '❤️', '🎯', '😢'];

export default function MessageItem({
  message,
  onDelete,
  onReaction,
  onReply,
  currentUserEmail,
  currentAvatarColor = '#0f62fe',
  isAdmin,
  isOwnMessage,
  roomOwnerEmail
}: MessageItemProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showReportDialog, setShowReportDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showCopyNotice, setShowCopyNotice] = React.useState(false);
  const [isLongPress, setIsLongPress] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<'top' | 'bottom'>('top');
  const longPressTimer = React.useRef<NodeJS.Timeout>();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const messageRef = React.useRef<HTMLDivElement>(null);

  const normalizedUserEmail = message.user_email?.toLowerCase() || '';
  const normalizedRoomOwnerEmail = roomOwnerEmail?.toLowerCase() || null;
  const isGlobalAdmin = normalizedUserEmail === 'goldbenchan@gmail.com' || normalizedUserEmail === 'kusanokiyoshi1@gmail.com';
  const isRoomOwner = normalizedRoomOwnerEmail ? normalizedUserEmail === normalizedRoomOwnerEmail : false;
  const shouldShowCrown = isGlobalAdmin || isRoomOwner;

  // デバイス判定
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 画面外クリックでメニューを閉じる
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenu]);

  // メンション検出
  const isMentioned = message.message.includes(`@${currentUserEmail.split('@')[0]}`);

  // リアクションカウント
  const getReactionCount = (emoji: string) => {
    return message.reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  // 自分がリアクションしているか
  const hasUserReacted = (emoji: string) => {
    return message.reactions?.some(r => r.emoji === emoji && r.user_email === currentUserEmail);
  };

  // PCでクリック、モバイルで長押し
  const handleMessageClick = (e: React.MouseEvent) => {
    if (!isMobile) {
      // PCの場合は通常のクリックでメニュー表示
      e.preventDefault();

      // メニューの表示位置を計算
      if (messageRef.current) {
        const rect = messageRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;

        // メニューの高さ（約300px）を考慮して、上下どちらに表示するか決定
        if (spaceAbove < 300 && spaceBelow > spaceAbove) {
          setMenuPosition('bottom');
        } else {
          setMenuPosition('top');
        }
      }

      setShowMenu(!showMenu);
    }
  };

  // 長押し開始（モバイルのみ）
  const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      longPressTimer.current = setTimeout(() => {
        // モバイルでもメニュー位置を計算
        if (messageRef.current) {
          const rect = messageRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceAbove = rect.top;
          const spaceBelow = viewportHeight - rect.bottom;

          if (spaceAbove < 300 && spaceBelow > spaceAbove) {
            setMenuPosition('bottom');
          } else {
            setMenuPosition('top');
          }
        }

        setIsLongPress(true);
        setShowMenu(true);
        // モバイルで振動フィードバック（対応デバイスのみ）
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 300); // 300ms長押しでメニュー表示
    }
  };

  // 長押し終了
  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // メッセージコピー
  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    setShowCopyNotice(true);
    setTimeout(() => setShowCopyNotice(false), 2000);
    setShowMenu(false);
  };

  return (
    <div
      ref={messageRef}
      id={`message-${message.id}`}
      className={`group relative flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 px-2 sm:px-4 transition-colors duration-300`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] ${
          isMentioned ? 'bg-blue-500/10 border-blue-500/30 border rounded-lg p-1' : ''
        }`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          {/* アバター */}
          {!isOwnMessage && (
            <div className="relative">
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: message.avatar_color || '#0f62fe' }}
              >
                <span className="text-[10px] sm:text-xs font-bold text-white">
                  {message.is_anonymous ? '?' : (message.display_name?.[0]?.toUpperCase() || '?')}
                </span>
              </div>
              {shouldShowCrown && (
                <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="white" />
                </div>
              )}
            </div>
          )}

          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            {/* ユーザー名と時間 */}
            <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs text-gray-600">
                {message.is_anonymous ? `匿名ユーザー` : message.display_name}
              </span>
              <span className="text-xs text-gray-400">
                {dayjs(message.created_at).format('HH:mm')}
              </span>
            </div>

            {/* メッセージ本体（引用リプライと一体化） */}
            <div className="relative">
              <div
                className={`rounded-2xl cursor-pointer overflow-hidden ${
                  isOwnMessage
                    ? 'bg-blue-600'
                    : 'bg-gray-100'
                }`}
                onClick={handleMessageClick}
                onMouseDown={isMobile ? handleLongPressStart : undefined}
                onMouseUp={isMobile ? handleLongPressEnd : undefined}
                onMouseLeave={isMobile ? handleLongPressEnd : undefined}
                onTouchStart={isMobile ? handleLongPressStart : undefined}
                onTouchEnd={isMobile ? handleLongPressEnd : undefined}
              >
                {/* 引用リプライ部分（LINE風に上部に一体化） */}
                {message.reply_to && (
                  <div className={`px-3 py-2 sm:px-4 border-b ${
                    isOwnMessage
                      ? 'bg-black/10 border-black/10'
                      : 'bg-gray-200 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Reply className={`w-3 h-3 ${
                        isOwnMessage ? 'text-white/70' : 'text-gray-600'
                      }`} />
                      <span className={`text-xs font-medium ${
                        isOwnMessage ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {message.reply_to.is_anonymous ? '匿名ユーザー' : message.reply_to.display_name}
                      </span>
                    </div>
                    <p className={`text-xs line-clamp-2 ${
                      isOwnMessage ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      {message.reply_to.message}
                    </p>
                  </div>
                )}

                {/* メッセージ本文 */}
                <div className="px-3 py-2 sm:px-4">
                  <p className={`text-xs sm:text-sm whitespace-pre-wrap break-words select-none sm:select-text ${
                    isOwnMessage ? 'text-white' : 'text-gray-900'
                  }`}>
                    {message.message}
                  </p>
                </div>
              </div>

            {/* LINE風メニュー（長押しまたはホバーで表示） */}
            <AnimatePresence>
                {showMenu && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95, y: menuPosition === 'top' ? -10 : 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: menuPosition === 'top' ? -10 : 10 }}
                    className={`absolute z-50 ${
                      isOwnMessage ? 'right-0' : 'left-0'
                    } ${
                      menuPosition === 'top'
                        ? 'bottom-full mb-2'
                        : 'top-full mt-2'
                    } bg-white rounded-lg shadow-xl border border-gray-200 min-w-[160px]`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      {/* リプライ */}
                      {onReply && (
                        <button
                          onClick={() => {
                            onReply(message);
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 w-full text-left transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          <span>返信</span>
                        </button>
                      )}

                      {/* コピー */}
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 w-full text-left transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>コピー</span>
                      </button>

                      {/* 削除（管理者または自分のメッセージ） */}
                      {(isAdmin || isOwnMessage) && onDelete && (
                          <>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => {
                                setShowDeleteDialog(true);
                                setShowMenu(false);
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>削除</span>
                            </button>
                          </>
                      )}

                      {/* 通報（他人のメッセージ） */}
                      {!isOwnMessage && (
                        <>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => {
                              setShowReportDialog(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-600 hover:bg-gray-100 w-full text-left transition-colors"
                          >
                            <Flag className="w-4 h-4" />
                            <span>通報</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* リアクション */}
            <div className={`flex items-center gap-1 mt-1 pb-2 ${
              message.reactions && message.reactions.length > 0
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            } transition-opacity`} style={{ position: 'relative', zIndex: 1, paddingBottom: '8px' }}>
              {reactionEmojis.map(emoji => {
                const count = getReactionCount(emoji);
                const hasReacted = hasUserReacted(emoji);

                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (onReaction) {
                        onReaction(message.id, emoji);
                      } else {
                        console.error('onReaction is not defined!');
                      }
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all cursor-pointer select-none ${
                      hasReacted
                        ? 'bg-blue-100 border border-blue-600'
                        : 'bg-gray-100 border border-transparent hover:border-blue-500/50'
                    } ${count === 0 ? 'opacity-50' : ''}`}
                    style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span className="text-gray-600">{count}</span>}
                  </button>
                );
              })}


            </div>
          </div>

          {/* 自分のメッセージの場合、右側にアバター */}
          {isOwnMessage && (
            <div className="relative">
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: currentAvatarColor }}
              >
                <span className="text-[10px] sm:text-xs font-bold text-white">
                  {message.is_anonymous ? '?' : (message.display_name?.[0]?.toUpperCase() || '?')}
                </span>
              </div>
              {shouldShowCrown && (
                <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* コピー通知 */}
      <AnimatePresence>
        {showCopyNotice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <span className="text-sm">コピーしました</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 削除確認ダイアログ */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-4 max-w-xs mx-4 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">メッセージを削除</h3>
              <p className="text-xs text-gray-600 mb-3">
                このメッセージを削除しますか？<br />
                この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    onDelete?.(message.id);
                    setShowDeleteDialog(false);
                  }}
                  className="flex-1 px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  削除する
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
