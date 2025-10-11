"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAILS = ["goldbenchan@gmail.com", "kusanokiyoshi1@gmail.com"];

const primaryLinks = [
  { href: "#value", label: "Value Propositions" },
  { href: "#journey", label: "Data Journey" },
  { href: "#roadmap", label: "Beta Roadmap" },
  { href: "/chat", label: "チャットモック" },
  { href: "/my-account", label: "マイアカウント" },
];

export function HeaderNav() {
  const { user } = useAuth();
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  const openMenu = useCallback(() => {
    if (menuVisible) return;
    setMenuMounted(true);
    requestAnimationFrame(() => setMenuVisible(true));
  }, [menuVisible]);

  const closeMenu = useCallback(() => {
    if (!menuVisible) {
      setMenuMounted(false);
      return;
    }
    setMenuVisible(false);
  }, [menuVisible]);

  const toggleMenu = useCallback(() => {
    if (menuVisible) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [closeMenu, menuVisible, openMenu]);

  useEffect(() => {
    if (!menuMounted) {
      return;
    }

    if (menuVisible) {
      const html = document.documentElement;
      const body = document.body;
      const previousHtmlOverflow = html.style.overflow;
      const previousBodyOverflow = body.style.overflow;

      html.style.overflow = "hidden";
      body.style.overflow = "hidden";

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        html.style.overflow = previousHtmlOverflow;
        body.style.overflow = previousBodyOverflow;
      };
    }

    const timer = window.setTimeout(() => setMenuMounted(false), 320);
    return () => window.clearTimeout(timer);
  }, [closeMenu, menuMounted, menuVisible]);

  return (
    <>
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
          <button
            type="button"
            aria-expanded={menuVisible}
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
        </div>
      </header>
      {menuMounted && (
            <div className="fixed inset-0 z-[9999]">
              <div
                role="presentation"
                className={`absolute inset-0 bg-[#040717]/70 backdrop-blur-md transition-opacity duration-300 ${menuVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
                onClick={closeMenu}
              />
              <aside
                id="nav-menu"
                aria-hidden={!menuVisible}
                className={`fixed right-0 top-0 flex h-screen w-full max-w-[420px] flex-col justify-between bg-gradient-to-b from-white/98 via-white/95 to-white/92 text-left shadow-[0_25px_60px_rgba(9,12,38,0.25)] transition-transform duration-300 ease-out ${menuVisible ? "translate-x-0" : "translate-x-full"}`}
              >
                <div className="flex items-center justify-between border-b border-white/60 px-7 py-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#3dd6d0]">Menu</p>
                    <p className="text-xs text-[#4f5d7a]">競艇版 D-Logic Boat Navigation</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe7fb] bg-white text-base font-semibold text-[#0b1533] transition-transform hover:-translate-y-0.5"
                    aria-label="メニューを閉じる"
                  >
                    ×
                  </button>
                </div>

                <nav className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-7 py-10 text-base">
                  <div className="space-y-3 text-[var(--foreground)]">
                    {primaryLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className="block rounded-2xl border border-transparent bg-white/60 px-5 py-4 text-sm font-semibold text-[#0b1533] no-underline transition hover:border-[#0f62fe]/40 hover:bg-[#e6f0ff] hover:text-[#0f62fe]"
                      >
                        {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="block rounded-2xl border border-[#0f62fe]/40 bg-gradient-to-r from-[#e6f0ff] to-[#f5f8ff] px-5 py-4 text-sm font-semibold text-[#0f62fe] no-underline transition hover:border-[#0f62fe] hover:from-[#d6e8ff] hover:to-[#e6f0ff]"
                      >
                        🛡️ 管理者パネル
                      </Link>
                    )}
                  </div>

                  <div className="space-y-4 rounded-3xl border border-[#d5dff4] bg-[#f5f8ff] p-6 shadow-[0_20px_45px_rgba(13,28,63,0.12)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3dd6d0]">
                      Early Access
                    </p>
                    <p className="text-sm leading-relaxed text-[#4f5d7a]">
                      Google サインインで競艇AIのクローズドβに参加し、予測ダッシュボードを先行体験できます。
                    </p>
                    <Link
                      href="https://boat.dlogicai.in/auth/sign-in"
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-2xl bg-[#0f62fe] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,40,87,0.3)] transition-transform hover:-translate-y-0.5"
                    >
                      <span>サインイン / 登録</span>
                      <span aria-hidden className="text-xs">→</span>
                    </Link>
                  </div>
                </nav>

                <div className="border-t border-white/60 px-7 py-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#8892a6]">© D-Logic 2025</p>
                </div>
              </aside>
            </div>
      )}
    </>
  );
}
