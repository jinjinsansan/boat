"use client"

import { useEffect, useState } from "react"

interface InlineLoaderProps {
  size?: "small" | "medium" | "large"
  text?: string
}

export default function InlineLoader({ size = "medium", text }: InlineLoaderProps) {
  const [dots, setDots] = useState("")
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
      setPulse((prev) => (prev + 1) % 5)
    }, 500)

    return () => window.clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: "h-8 text-sm",
    medium: "h-12 text-base",
    large: "h-16 text-lg",
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${sizeClasses[size]}`}>
      <div className="relative">
        <span
          className="font-black"
          style={{
            color: "#0f62fe",
            fontSize: size === "small" ? "1.5rem" : size === "medium" ? "2rem" : "2.5rem",
            textShadow: "0 0 10px rgba(15,98,254,0.3)",
            fontFamily: "Arial Black, sans-serif",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          D
        </span>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`loader-bar-${index}`}
            className="w-1 rounded-full bg-[#0f62fe] transition-all duration-300"
            style={{
              height: pulse === index ? "100%" : "40%",
              opacity: pulse === index ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {text && <span className="font-mono text-sm text-[#0f62fe]">{text}{dots}</span>}
    </div>
  )
}
