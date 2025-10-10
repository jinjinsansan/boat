import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const navLinks = [
  { href: "/", label: "トップ" },
  { href: "/races", label: "レース一覧" },
  { href: "/chat", label: "チャット" },
];

export default function BoatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand-logo.svg"
              alt="D-Logic Boat"
              width={160}
              height={48}
              priority
            />
          </Link>
          <nav className="hidden gap-6 text-sm font-medium text-[var(--muted)] md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[var(--brand-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl gap-4 px-6 pb-4 text-sm font-medium text-[var(--muted)] md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-center transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 bg-[var(--background)]">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <span>© {year} D-Logic Boat</span>
          <span>競艇AIプラットフォーム（UIモック）</span>
        </div>
      </footer>
    </div>
  );
}
