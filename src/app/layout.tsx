import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_JP, Roboto_Mono } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "D-Logic Boat UI",
  description: "競艇向けD-Logic体験のためのフロントエンドUI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="ja" className="h-full">
      <body
        className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] ${notoSans.variable} ${robotoMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
              <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide text-[#102a43]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white text-2xl font-black text-[#0f62fe] shadow-[0_10px_30px_rgba(15,40,87,0.12)]">
                  D
                </span>
                <span className="hidden sm:inline">D-Logic Boat</span>
              </Link>
              <button
                type="button"
                aria-label="メニューを開く"
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] shadow-[0_8px_20px_rgba(15,40,87,0.08)] transition-transform hover:-translate-y-0.5"
              >
                <span className="relative flex h-4 w-6 items-center justify-center">
                  <span className="absolute h-0.5 w-full -translate-y-2 rounded-full bg-[var(--foreground)] transition-transform group-hover:-translate-y-2.5" />
                  <span className="absolute h-0.5 w-full rounded-full bg-[var(--foreground)]" />
                  <span className="absolute h-0.5 w-full translate-y-2 rounded-full bg-[var(--foreground)] transition-transform group-hover:translate-y-2.5" />
                </span>
              </button>
            </div>
          </header>

          <main className="flex-1 bg-[var(--background)]">{children}</main>

          <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
              <span>© {year} D-Logic Boat</span>
              <span>競艇AIプラットフォーム（UIモック）</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
