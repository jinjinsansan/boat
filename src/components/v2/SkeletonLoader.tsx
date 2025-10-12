"use client"

import React from "react"

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-[#eff3ff] ${className}`} />
)

export const MyAccountSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-24" />
    <Skeleton className="h-32" />
    <Skeleton className="h-32" />
    <Skeleton className="h-48" />
  </div>
)
