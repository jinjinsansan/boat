"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const heroMetrics = [
  { label: "応答時間", value: "約2秒", color: "bg-emerald-400" },
  { label: "チャット形式", value: "レース別対話", color: "bg-sky-400" },
  { label: "対象", value: "全国競艇場対応予定", color: "bg-[#ffb347]" },
];

const heroImages = [
  "/hero-01.jpg",
  "/hero-02.jpg",
  "/hero-03.jpg",
  "/hero-04.jpg",
  "/hero-05.jpg",
  "/hero-06.jpg",
];

export function HeroSection() {
  const imageSequence = useMemo(() => {
    const shuffled = [...heroImages];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (imageSequence.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % imageSequence.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [imageSequence.length]);

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-[#0b1533] text-white">
      <div className="absolute inset-0">
        {imageSequence.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,42,67,0.45),_rgba(11,21,51,0.65))]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#041027]/45 via-[#020717]/55 to-[#01030f]/65" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 md:items-start">
        <div className="max-w-2xl space-y-8 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm uppercase tracking-[0.3em] text-[#3dd6d0]">
            Next Gen Boat Intelligence
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            競艇AI <span className="text-[#0f62fe] drop-shadow-[0_0_25px_rgba(15,98,254,0.45)]">D-Logic Boat</span>
            <span className="block text-3xl font-semibold text-white/85 md:text-4xl">
              レース分析をあなたの手に
            </span>
          </h1>
          <p className="max-w-xl text-base text-white/85 md:text-lg">
            競馬版で培った10基のAIエンジンを競艇向けに最適化。公式データを解析し、進入・モーター・潮汐まで一括分析する次世代の競艇予想プラットフォームです。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/races"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1533] shadow-[0_10px_30px_rgba(15,98,254,0.35)] transition-transform hover:-translate-y-0.5"
            >
              レース一覧を開く
            </Link>
            <Link
              href="/chat"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              分析チャットを見る
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-white/70 md:justify-start">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 backdrop-blur-sm">
                <span className={`h-2 w-2 rounded-full ${metric.color}`} />
                <span className="font-medium text-white/80">{metric.label}</span>
                <span className="text-white/60">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
