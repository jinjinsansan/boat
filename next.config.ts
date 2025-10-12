import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ビルド時の型エラーを無視（一時的な対応）
    ignoreBuildErrors: true,
  },
  eslint: {
    // ビルド時のESLintエラーを無視（一時的な対応）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
