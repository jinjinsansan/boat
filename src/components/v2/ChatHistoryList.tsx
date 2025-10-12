"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ChevronRight, Loader2, MessageCircle, Trash2 } from "lucide-react"

import { v2ApiClient } from "@/lib/v2/apiClient"
import { cacheManager } from "@/utils/cacheUtils"

interface ChatSession {
  id: string
  race_id: string
  race_date: string
  venue: string
  race_number: number
  race_name: string
  created_at: string
  last_accessed_at: string
  message_count: number
}

export function ChatHistoryList() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const limit = 10

  const fetchAndUpdateSessions = useCallback(
    async (cacheKey: string, updateLoading: boolean, currentPage: number) => {
      try {
        if (updateLoading) setLoading(true)

        const response = await v2ApiClient.getChatSessions(limit, currentPage * limit)
        const fetchedSessions = response.sessions as ChatSession[]

        if (currentPage === 0) {
          setSessions(fetchedSessions)
          cacheManager.set(cacheKey, { sessions: fetchedSessions }, 5 * 60 * 1000)
        } else {
          setSessions((prev) => [...prev, ...fetchedSessions])
        }

        setHasMore(fetchedSessions.length === limit)
        setIsInitialLoad(false)
      } finally {
        if (updateLoading) setLoading(false)
      }
    },
    [limit],
  )

  const loadSessions = useCallback(
    async (currentPage: number) => {
      try {
        const cacheKey = `chat_sessions_${currentPage}`

        if (isInitialLoad && currentPage === 0) {
          const { data: cachedData, isStale } = cacheManager.isStale<{ sessions: ChatSession[] }>(cacheKey)

          if (cachedData) {
            setSessions(cachedData.sessions)
            setHasMore(cachedData.sessions.length === limit)
            setLoading(false)
            setIsInitialLoad(false)

            if (isStale) {
              void fetchAndUpdateSessions(cacheKey, false, currentPage)
            }
            return
          }
        }

        setLoading(true)
        setError(null)
        await fetchAndUpdateSessions(cacheKey, true, currentPage)
      } catch (err) {
        console.error("[Boat] Failed to load chat sessions:", err)
        setError("チャット履歴の読み込みに失敗しました")
        setLoading(false)
      }
    },
    [fetchAndUpdateSessions, isInitialLoad, limit],
  )

  useEffect(() => {
    void loadSessions(page)
  }, [loadSessions, page])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "今日"
    if (diffInDays === 1) return "昨日"
    if (diffInDays < 7) return `${diffInDays}日前`

    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleSessionClick = (sessionId: string) => {
    router.push(`/v2/chat/${sessionId}`)
  }

  const handleDeleteSession = async (event: React.MouseEvent, sessionId: string) => {
    event.stopPropagation()

    if (!window.confirm("このチャット履歴を削除してもよろしいですか？\n削除後は復元できません。")) {
      return
    }

    try {
      await v2ApiClient.deleteChatSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      cacheManager.remove("chat_sessions_0")
    } catch (err) {
      console.error("[Boat] Failed to delete session:", err)
      alert("削除中にエラーが発生しました")
    }
  }

  if (loading && page === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0f62fe]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadSessions(page)}
          className="rounded-full bg-[#0f62fe] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0946c3]"
        >
          再読み込み
        </button>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="py-12 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-[#dfe7fb]" />
        <p className="mt-4 text-sm text-[#4f5d7a]">チャット履歴がありません</p>
        <p className="mt-2 text-xs text-[#8291b3]">レース分析を開始すると、ここに履歴が表示されます。</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((sessionItem) => (
        <div
          key={sessionItem.id}
          className="cursor-pointer rounded-2xl border border-[#dfe7fb] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0f62fe]/30"
          onClick={() => handleSessionClick(sessionItem.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#102a43]">
                {sessionItem.venue} {sessionItem.race_number}R - {sessionItem.race_name}
              </h3>
              <div className="mt-2 flex items-center gap-4 text-xs text-[#4f5d7a]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(sessionItem.race_date).toLocaleDateString("ja-JP")}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {sessionItem.message_count} メッセージ
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => handleDeleteSession(event, sessionItem.id)}
                className="rounded-full p-2 text-[#8291b3] transition-colors hover:bg-[#f5f8ff] hover:text-rose-500"
                title="削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <ChevronRight className="h-5 w-5 text-[#8291b3]" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 border-t border-[#eff3ff] pt-3 text-xs text-[#8291b3]">
            <span>作成: {formatDate(sessionItem.created_at)}</span>
            <span>最終アクセス: {formatDate(sessionItem.last_accessed_at)}</span>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#dfe7fb] bg-white py-3 text-sm font-semibold text-[#0f62fe] transition-colors hover:bg-[#f5f8ff] disabled:cursor-not-allowed disabled:bg-[#f5f8ff]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> 読み込み中...
            </>
          ) : (
            "さらに読み込む"
          )}
        </button>
      )}
    </div>
  )
}
