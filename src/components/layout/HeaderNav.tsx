"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function HeaderNav() {
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);

  useEffect(() => {
    if (open) {
      setRenderMenu(true);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    const timeout = window.setTimeout(() => setRenderMenu(false), 280);
    document.body.style.overflow = "";
    return () => window.clearTimeout(timeout);
  }, [open]);

  const toggleMenu = () => setOpen((prev) => !prev);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-wide text-[#102a43]"
        >
          <span className="flex h-10 w-10 items-center justify-center border border-[#0f62fe]/80 bg-white text-xl font-black text-[#0f62fe] shadow-[0_8px_20px_rgba(15,40,87,0.12)]">
            D
          </span>
          <span className="hidden sm:inline text-xs font-semibold tracking-[0.3em] text-[#4f5d7a]">
            競艇AI D-Logic Boat
          </span>
        </Link>
        <div className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={toggleMenu}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] shadow-[0_6px_16px_rgba(15,40,87,0.08)] transition-transform hover:-translate-y-0.5"
          >
            <span className="relative flex h-4 w-6 items-center justify-center">
              <span className="absolute h-0.5 w-full -translate-y-2 rounded-full bg-[var(--foreground)] transition-transform group-hover:-translate-y-2.5" />
              <span className="absolute h-0.5 w-full rounded-full bg-[var(--foreground)]" />
              <span className="absolute h-0.5 w-full translate-y-2 rounded-full bg-[var(--foreground)] transition-transform group-hover:translate-y-2.5" />
            </span>
          </button>
          {renderMenu && (
            <div className="fixed inset-0 z-50">
              <div
                role="presentation"
                className={`absolute inset-0 bg-[var(--background)]/70 backdrop-blur transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
                onClick={closeMenu}
              />
              <aside
                id="nav-menu"
                aria-hidden={!open}
                className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col justify-between bg-white/95 text-left shadow-[0_25px_60px_rgba(9,12,38,0.18)] transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
                  <p className="text-xs font-semibold tracking-[0.35em] text-[#4f5d7a]">MENU</p>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-sm font-semibold text-[var(--foreground)] transition-transform hover:-translate-y-0.5"
                    aria-label="メニューを閉じる"
                  >
                    ×
                  </button>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto px-6 py-8 text-base">
                  <div className="space-y-3 text-[var(--foreground)]">
                    <Link href="#value" onClick={closeMenu} className="block rounded-xl border border-transparent px-4 py-3 font-semibold hover:border-[#0f62fe]/30 hover:bg-[#e6f0ff]">
                      Value Propositions
                    </Link>
                    <Link href="#journey" onClick={closeMenu} className="block rounded-xl border border-transparent px-4 py-3 font-semibold hover:border-[#0f62fe]/30 hover:bg-[#e6f0ff]">
                      Data Journey
                    </Link>
                    <Link href="#roadmap" onClick={closeMenu} className="block rounded-xl border border-transparent px-4 py-3 font-semibold hover:border-[#0f62fe]/30 hover:bg-[#e6f0ff]">
                      Beta Roadmap
                    </Link>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-[#d5dff4] bg-[#f8fbff] p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3dd6d0]">
                      Early Access
                    </p>
                    <p className="text-sm text-[#4f5d7a]">
                      Google サインインでクローズドβへ参加しましょう。
                    </p>
                    <Link
                      href="https://boat.dlogicai.in/auth/sign-in"
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-xl bg-[#0f62fe] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,40,87,0.25)] transition-transform hover:-translate-y-0.5"
                    >
                      <span>サインイン / 登録</span>
                      <span aria-hidden className="text-xs">→</span>
                    </Link>
                  </div>
                </nav>

                <div className="border-t border-[var(--border)] px-6 py-6">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-[#8892a6]">© D-Logic 2025</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
