import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageInputProps {
  onSend: (message: string) => void;
  sending: boolean;
  placeholder?: string;
  maxLength?: number;
  displayName: string;
  isAnonymous: boolean;
  avatarColor: string;
  lockDisplayName?: boolean;
  onDisplayNameChange: (name: string) => void;
  onAnonymousChange: (anonymous: boolean) => void;
  onAvatarColorChange: (color: string) => void;
  onLockDisplayNameChange?: (locked: boolean) => void;
  onlineUsers?: any[];
}

export default function OpenChatMessageInput({
  onSend,
  sending,
  placeholder = 'メッセージを入力...',
  maxLength = 1000,
  displayName,
  isAnonymous,
  avatarColor,
  lockDisplayName = false,
  onDisplayNameChange,
  onAnonymousChange,
  onAvatarColorChange,
  onLockDisplayNameChange,
  onlineUsers = []
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 絵文字カテゴリー
  const [emojiCategory, setEmojiCategory] = useState<'popular' | 'boat'>('popular');

  // よく使う絵文字
  const popularEmojis = ['😀', '😂', '❤️', '👍', '🎯', '🔥', '✨', '🙏'];

  // 競艇特化の絵文字
  const boatRacingEmojis = [
    '⛵', '🚤', '🛥️', '🏆', '🥇', '🥈', '🥉', '🎖️',
    '💰', '💴', '💵', '🎰', '🍀', '⭐', '💯', '📊',
    '📈', '📉', '🎊', '🎉', '🙌', '💪', '🔥', '⚡'
  ];

  const quickEmojis = emojiCategory === 'popular' ? popularEmojis : boatRacingEmojis;

  // メッセージ送信
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !sending) {
      onSend(trimmedMessage);
      setMessage('');
      setShowEmoji(false);

      // テキストエリアの高さをリセット
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // エンターキーで送信（Shift+Enterで改行）
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // メンションリストが表示されている場合はメンションハンドラーを優先
    if (showMentions) {
      handleMentionKeyDown(e);
      if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        return;
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // テキストエリアの自動リサイズ
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);

      // @の検出とメンション機能の表示
      const lastAtIndex = value.lastIndexOf('@');
      const textAfterAt = value.substring(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (lastAtIndex !== -1 && !hasSpaceAfterAt) {
        setShowMentions(true);
        setMentionSearch(textAfterAt);
        setSelectedMentionIndex(0);
      } else {
        setShowMentions(false);
        setMentionSearch('');
      }

      // 自動リサイズ
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  };

  // 絵文字を追加
  const addEmoji = (emoji: string) => {
    const newMessage = message + emoji;
    if (newMessage.length <= maxLength) {
      setMessage(newMessage);
      textareaRef.current?.focus();
    }
  };

  // フィルタリングされたユーザーリスト
  const filteredUsers = onlineUsers.filter(user => {
    const displayName = user.isAnonymous ? user.displayName : user.displayName;
    return displayName.toLowerCase().includes(mentionSearch.toLowerCase());
  });

  // メンション選択
  const selectMention = (user: any) => {
    const displayName = user.displayName;
    const lastAtIndex = message.lastIndexOf('@');
    const beforeMention = message.substring(0, lastAtIndex);
    const afterMention = message.substring(lastAtIndex + mentionSearch.length + 1);
    const newMessage = `${beforeMention}@${displayName} ${afterMention}`;
    setMessage(newMessage);
    setShowMentions(false);
    setMentionSearch('');
    setSelectedMentionIndex(0);
    textareaRef.current?.focus();
  };

  // キーボードナビゲーション
  const handleMentionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMentionIndex((prev) => 
        prev < filteredUsers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMentionIndex((prev) => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (filteredUsers[selectedMentionIndex]) {
        selectMention(filteredUsers[selectedMentionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowMentions(false);
      setMentionSearch('');
    }
  };

  // アバターカラーオプション（12色）
  const avatarColors = [
    '#0f62fe', // ブルー（競艇メインカラー）
    '#0ECB81', // グリーン
    '#F6465D', // レッド
    '#8B5CF6', // パープル
    '#EC4899', // ピンク
    '#FF6B6B', // コーラル
    '#4ECDC4', // ターコイズ
    '#95E1D3', // ミント
    '#FFA502', // オレンジ
    '#A29BFE', // ラベンダー
    '#6C5CE7', // バイオレット
    '#F0B90B'  // ゴールド
  ];

  return (
    <div className="space-y-2">
      {/* 表示名設定バー - レスポンシブ最適化 */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 rounded-lg w-full overflow-hidden">
        {/* アバターカラー選択 */}
        <button
          onClick={() => {
            const currentIndex = avatarColors.indexOf(avatarColor);
            const nextIndex = (currentIndex + 1) % avatarColors.length;
            onAvatarColorChange(avatarColors[nextIndex]);
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all hover:scale-110 flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
          title="アバターカラーを変更"
        >
          <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white m-auto" />
        </button>

        {/* 表示名入力 - モバイルでも適切なサイズ */}
        {!isAnonymous && (
          <input
            type="text"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="表示名を入力"
            className="flex-1 min-w-0 px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-gray-900 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            maxLength={30}
          />
        )}

        {/* 匿名の場合の表示 */}
        {isAnonymous && (
          <div className="flex-1 min-w-0 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-200 text-gray-600 rounded text-xs sm:text-sm truncate">
            匿名で投稿
          </div>
        )}

        {/* 匿名チェックボックス - コンパクトに */}
        <label className="flex items-center gap-1 sm:gap-2 cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => onAnonymousChange(e.target.checked)}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600 focus:ring-1"
          />
          <span className="text-xs sm:text-sm text-gray-900 whitespace-nowrap">匿名</span>
        </label>

        {/* 表示名固定チェックボックス */}
        {!isAnonymous && onLockDisplayNameChange && (
          <label className="flex items-center gap-1 sm:gap-2 cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={lockDisplayName}
              onChange={(e) => onLockDisplayNameChange(e.target.checked)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600 focus:ring-1"
            />
            <span className="text-xs sm:text-sm text-gray-900 whitespace-nowrap">固定</span>
          </label>
        )}
      </div>

      {/* メッセージ入力エリア */}
      <div className="relative">
      {/* 絵文字ピッカー */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg"
          >
            {/* カテゴリータブ */}
            <div className="flex gap-2 mb-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => setEmojiCategory('popular')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  emojiCategory === 'popular'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                人気
              </button>
              <button
                onClick={() => setEmojiCategory('boat')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  emojiCategory === 'boat'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⛵ 競艇
              </button>
            </div>

            {/* 絵文字グリッド */}
            <div className="grid grid-cols-8 gap-1 max-w-[320px]">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-xl hover:bg-gray-100 p-1.5 rounded transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1 sm:gap-2">
        {/* 入力エリア */}
        <div className="flex-1 relative">
          {/* メンションリスト */}
          <AnimatePresence>
            {showMentions && filteredUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
              >
                <div className="p-2 text-xs text-gray-600 border-b border-gray-200">
                  ユーザーを選択 (@{mentionSearch})
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredUsers.map((user, index) => (
                    <button
                      key={user.email || index}
                      onClick={() => selectMention(user)}
                      onMouseEnter={() => setSelectedMentionIndex(index)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                        index === selectedMentionIndex ? 'bg-gray-100 text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      @{user.displayName}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={sending}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none resize-none transition-all placeholder-gray-400 disabled:opacity-50"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            rows={1}
          />

          {/* 文字数カウンター */}
          <div className="absolute bottom-2 right-3 text-xs text-gray-500">
            {message.length}/{maxLength}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-1">
          {/* 絵文字ボタン */}
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            disabled={sending}
            className="p-2 sm:p-3 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="絵文字"
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>


          {/* 送信ボタン */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className={`p-2 sm:p-3 rounded-lg transition-all ${
              message.trim() && !sending
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="送信 (Enter)"
          >
            {sending ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ショートカットヒント - モバイルでは非表示 */}
      <div className="hidden sm:flex mt-2 text-xs text-gray-500 justify-between">
        <span>Enter で送信 • Shift+Enter で改行</span>
        <span>@でメンション</span>
      </div>
    </div>
    </div>
  );
}
