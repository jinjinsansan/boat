"use client"

import React from "react"

interface ReferralCardProps {
  referralCount: number
}

interface CardTier {
  name: string
  gradient: string
  textColor: string
  glowColor: string
}

const getCardTier = (count: number): CardTier => {
  if (count >= 301) {
    return {
      name: "Platinum Card",
      gradient: "linear-gradient(135deg, #E5E4E2 0%, #BEC2CB 100%)",
      textColor: "#2D3748",
      glowColor: "#BEC2CB",
    }
  } else if (count >= 101) {
    return {
      name: "Gold Card",
      gradient: "linear-gradient(135deg, #FFD700 0%, #FFA000 100%)",
      textColor: "#2D3748",
      glowColor: "#FFD700",
    }
  } else if (count >= 51) {
    return {
      name: "Silver Card",
      gradient: "linear-gradient(135deg, #C0C0C0 0%, #B8B8B8 100%)",
      textColor: "#2D3748",
      glowColor: "#C0C0C0",
    }
  } else if (count >= 21) {
    return {
      name: "Bronze Card",
      gradient: "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)",
      textColor: "#FFFFFF",
      glowColor: "#CD7F32",
    }
  } else if (count >= 11) {
    return {
      name: "Red Card",
      gradient: "linear-gradient(135deg, #F44336 0%, #FF5252 100%)",
      textColor: "#FFFFFF",
      glowColor: "#F44336",
    }
  } else if (count >= 6) {
    return {
      name: "Pink Card",
      gradient: "linear-gradient(135deg, #E91E63 0%, #FF4081 100%)",
      textColor: "#FFFFFF",
      glowColor: "#E91E63",
    }
  } else if (count >= 3) {
    return {
      name: "Green Card",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
      textColor: "#FFFFFF",
      glowColor: "#4CAF50",
    }
  }
  return {
    name: "White Card",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)",
    textColor: "#2D3748",
    glowColor: "#E0E0E0",
  }
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ referralCount }) => {
  const tier = getCardTier(referralCount)

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "400px",
    aspectRatio: "16/10",
    background: tier.gradient,
    borderRadius: "16px",
    padding: "24px",
    position: "relative",
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.15),
      0 0 0 1px ${tier.glowColor}40,
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
    overflow: "hidden",
    fontFamily: "var(--font-sans)",
    color: tier.textColor,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  }

  const watermarkStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "clamp(120px, 20vw, 200px)",
    fontWeight: "900",
    opacity: 0.1,
    color: tier.textColor,
    userSelect: "none",
    pointerEvents: "none",
    zIndex: 1,
  }

  const contentStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  }

  const gradeStyle: React.CSSProperties = {
    fontSize: "clamp(14px, 2.5vw, 18px)",
    fontWeight: "600",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  }

  const titleStyle: React.CSSProperties = {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: "700",
    letterSpacing: "1px",
    textAlign: "center",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  }

  const referralCountStyle: React.CSSProperties = {
    fontSize: "clamp(16px, 3vw, 20px)",
    fontWeight: "600",
    textAlign: "right",
    letterSpacing: "0.5px",
  }

  const glossyOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)",
    borderRadius: "16px 16px 0 0",
    pointerEvents: "none",
    zIndex: 3,
  }

  return (
    <div style={cardStyle}>
      <div style={watermarkStyle}>D</div>
      <div style={glossyOverlayStyle} />
      <div style={contentStyle}>
        <div style={gradeStyle}>{tier.name}</div>
        <div style={titleStyle}>Referral Card</div>
        <div style={referralCountStyle}>Referral {referralCount.toString().padStart(2, "0")}</div>
      </div>
    </div>
  )
}

export default ReferralCard
