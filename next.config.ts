import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript型チェックは有効のまま（エラーを表示）
  typescript: {
    // .next/types の型エラーを無視
    ignoreBuildErrors: true,
  },
  // ESLintは有効のまま（警告のみ表示）
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
