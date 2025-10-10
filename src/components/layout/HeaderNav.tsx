"use client";

import { useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";

export function HeaderNav() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen((prev) => !prev);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error(error);
    }
  };

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
          {open && (
            <>
              <div
                role="presentation"
                className="fixed inset-0 z-40"
                onClick={closeMenu}
              />
              <div
                id="nav-menu"
                className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm shadow-[0_20px_40px_rgba(15,40,87,0.12)]"
              >
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      handleSignIn();
                    }}
                    className="w-full rounded-xl bg-[#0f62fe] px-4 py-3 text-left font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Googleでサインイン
                  </button>
                  <p className="text-xs text-[var(--muted)]">
                    Google アカウントで競艇版 D-Logic にアクセスできます。
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
