"use client";

import React from "react";

interface LoopLogoProps {
  className?: string;
  size?: number | string;
  variant?: "full" | "icon";
  color?: "current" | "light" | "dark" | "gradient";
}

export default function LoopLogo({
  className = "",
  size = 28,
  variant = "full",
  color = "current",
}: LoopLogoProps) {
  const strokeColor =
    color === "light"
      ? "#FFFFFF"
      : color === "dark"
      ? "#0F172A"
      : color === "gradient"
      ? "url(#loop-gradient)"
      : "currentColor";

  if (variant === "icon") {
    // Just the infinity-p symbol
    return (
      <svg
        viewBox="65 14 95 72"
        className={`inline-block shrink-0 ${className}`}
        style={{ height: size, width: "auto" }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="loop-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        
        {/* Infinity loop combining second 'o' and 'p' */}
        <path
          d="M 82 50 C 82 39.5, 91 32, 100 32 C 108 32, 114.5 41.5, 118 50 C 121.5 58.5, 128 68, 136 68 C 145.5 68, 154 59.5, 154 50 C 154 40.5, 145.5 32, 136 32 C 128 32, 121.5 41.5, 118 50 C 114.5 58.5, 108 68, 100 68 C 91 68, 82 60.5, 82 50 Z"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Descending stem of 'p' */}
        <path
          d="M 118 50 L 118 84"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Full "loop" wordmark with exact geometry matching the reference logo
  return (
    <svg
      viewBox="0 14 160 74"
      className={`inline-block shrink-0 select-none ${className}`}
      style={{ height: size, width: "auto" }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="loop-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* 'l' — Tall clean vertical stroke */}
      <line
        x1="14"
        y1="16"
        x2="14"
        y2="68"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* First 'o' — Clean geometric circle */}
      <circle
        cx="48"
        cy="50"
        r="18"
        stroke={strokeColor}
        strokeWidth="3.2"
      />

      {/* Infinity loop combining second 'o' and 'p' */}
      <path
        d="M 82 50 C 82 39.5, 91 32, 100 32 C 108 32, 114.5 41.5, 118 50 C 121.5 58.5, 128 68, 136 68 C 145.5 68, 154 59.5, 154 50 C 154 40.5, 145.5 32, 136 32 C 128 32, 121.5 41.5, 118 50 C 114.5 58.5, 108 68, 100 68 C 91 68, 82 60.5, 82 50 Z"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Descending stem of 'p' */}
      <path
        d="M 118 50 L 118 84"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
