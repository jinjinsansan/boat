"use client"

import { useState } from "react"
import { AlertTriangle, Loader2, X } from "lucide-react"

interface AccountDeletionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  userEmail: string
}

export default function AccountDeletionDialog({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: AccountDeletionDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (confirmText !== "削除する") return

    setIsDeleting(true)
    setError(null)

    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "アカウント削除に失敗しました")
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur" onClick={isDeleting ? undefined : onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-[#ffd3d6] bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 text-[#8291b3] transition-colors hover:text-[#0f62fe] disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-[#b4232a]">
          <div className="rounded-full bg-[#ffe8eb] p-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#102a43]">アカウントを削除</h2>
            <p className="text-xs text-[#4f5d7a]">この操作は取り消せません</p>
          </div>
        </div>

        <div className="mt-4 space-y-4 text-sm text-[#4f5d7a]">
          <div className="rounded-2xl border border-[#ffd3d6] bg-[#fff1f2] px-4 py-3 text-xs">
            <p className="font-semibold text-[#b4232a]">削除されるデータ</p>
            <ul className="mt-2 space-y-1">
              <li>• すべてのポイント残高と履歴</li>
              <li>• すべてのチャット履歴</li>
              <li>• LINE連携情報および紹介実績</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#dfe7fb] bg-[#f5f8ff] px-4 py-3">
            <p className="text-xs text-[#4f5d7a]">削除対象アカウント</p>
            <p className="text-sm font-semibold text-[#102a43]">{userEmail}</p>
          </div>

          <div>
            <label className="text-xs text-[#4f5d7a]">
              アカウントを削除するには <span className="font-semibold text-[#b4232a]">削除する</span> と入力してください
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              disabled={isDeleting}
              placeholder="削除する"
              className="mt-2 w-full rounded-full border border-[#dfe7fb] px-4 py-3 text-sm text-[#102a43] focus:border-[#0f62fe] focus:outline-none disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-[#ffd3d6] bg-[#fff1f2] px-4 py-3 text-xs text-[#b4232a]">
              {error}
            </div>
          )}

          <div className="flex gap-3 text-sm font-semibold">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 rounded-full border border-[#dfe7fb] px-4 py-3 text-[#4f5d7a] transition-colors hover:bg-[#f5f8ff] disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmText !== "削除する" || isDeleting}
              className="flex-1 rounded-full bg-[#b4232a] px-4 py-3 text-white transition-colors hover:bg-[#92141f] disabled:cursor-not-allowed disabled:bg-[#f5bfc3]"
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 削除中...
                </span>
              ) : (
                "アカウントを削除"
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-[#8291b3]">
            削除後に復元が必要な場合はサポートまでご連絡ください。
          </p>
        </div>
      </div>
    </div>
  )
}
