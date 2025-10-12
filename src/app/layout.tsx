import type { Metadata } from "next";
import { Noto_Sans_JP, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { Toaster } from "react-hot-toast";

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
  title: "D-Logic Boat",
  description: "競艇向けD-Logic体験のためのフロントエンドUI",
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
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
          <HeaderNav />

          <main className="flex-1 bg-[var(--background)]">
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
          </main>

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
