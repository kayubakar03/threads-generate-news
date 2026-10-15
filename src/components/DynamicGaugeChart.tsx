import React, { useEffect, useState } from "react";
import { ThemeMode } from "../types";

interface DynamicGaugeChartProps {
  score: number; // 0 to 100
  title?: string;
  subtitle?: string;
  theme?: ThemeMode;
  size?: number; // width in px, default 280
  min?: number;
  max?: number;
  tierLabel?: string;
  tierColor?: string;
  interactive?: boolean;
  activeMetricName?: string;
}

export const DynamicGaugeChart: React.FC<DynamicGaugeChartProps> = ({
  score = 85,
  title,
  subtitle,
  theme = "dark",
  size = 280,
  min = 0,
  max = 100,
  tierLabel,
  tierColor,
  interactive = true,
  activeMetricName,
}) => {
  const isDark = theme === "dark";
  const [animatedScore, setAnimatedScore] = useState(0);

  // Smooth score counting animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900;
    const startVal = animatedScore;
    const endVal = Math.max(min, Math.min(max, score));

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(startVal + (endVal - startVal) * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [score, min, max]);

  // Geometry calculations
  const cx = 140;
  const cy = 135;
  const radius = 95;
  const strokeWidth = 14;

  // Arc angle spans from 180° (left) to 360° (right) = 180 degree semi-circle
  // Or 220 degree arc from -200° to +20°
  const startAngle = -190;
  const endAngle = 10;
  const angleRange = endAngle - startAngle; // 200 degrees

  const normalizedScore = Math.max(0, Math.min(100, animatedScore));
  const currentAngle = startAngle + (normalizedScore / 100) * angleRange;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  const backgroundArcPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const activeArcPath = describeArc(cx, cy, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));

  // Determine tier & status styling
  const getStatusDetails = (val: number) => {
    if (val >= 90) {
      return {
        label: tierLabel || "HYPER-VIRAL 🔥",
        colorClass: "text-rose-400",
        badgeBg: isDark ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-rose-100 text-rose-800 border-rose-300",
        glowColor: "rgba(244, 63, 94, 0.4)",
        gradientStart: "#ec4899",
        gradientEnd: "#f43f5e",
      };
    }
    if (val >= 78) {
      return {
        label: tierLabel || "VIRAL HEAT ⚡",
        colorClass: "text-amber-400",
        badgeBg: isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-amber-100 text-amber-800 border-amber-300",
        glowColor: "rgba(245, 158, 11, 0.4)",
        gradientStart: "#6366f1",
        gradientEnd: "#f59e0b",
      };
    }
    if (val >= 60) {
      return {
        label: tierLabel || "POTENSI TINGGI 🚀",
        colorClass: "text-emerald-400",
        badgeBg: isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-emerald-100 text-emerald-800 border-emerald-300",
        glowColor: "rgba(16, 185, 129, 0.4)",
        gradientStart: "#3b82f6",
        gradientEnd: "#10b981",
      };
    }
    if (val >= 40) {
      return {
        label: tierLabel || "MODERAT 📈",
        colorClass: "text-blue-400",
        badgeBg: isDark ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "bg-blue-100 text-blue-800 border-blue-300",
        glowColor: "rgba(59, 130, 246, 0.3)",
        gradientStart: "#64748b",
        gradientEnd: "#3b82f6",
      };
    }
    return {
      label: tierLabel || "STANDAR 💬",
      colorClass: "text-slate-400",
      badgeBg: isDark ? "bg-slate-700/50 text-slate-300 border-slate-600" : "bg-slate-100 text-slate-700 border-slate-300",
      glowColor: "rgba(148, 163, 184, 0.2)",
      gradientStart: "#475569",
      gradientEnd: "#94a3b8",
    };
  };

  const status = getStatusDetails(animatedScore);

  // Calculate needle tip & base
  const needleLength = radius - 16;
  const needleAngleRad = ((currentAngle - 90) * Math.PI) / 180;
  const needleTipX = cx + needleLength * Math.cos(needleAngleRad);
  const needleTipY = cy + needleLength * Math.sin(needleAngleRad);

  // Perpendicular points for needle base
  const needleBaseRadius = 7;
  const perpAngleRad = needleAngleRad + Math.PI / 2;
  const needleLeftX = cx + needleBaseRadius * Math.cos(perpAngleRad);
  const needleLeftY = cy + needleBaseRadius * Math.sin(perpAngleRad);
  const needleRightX = cx - needleBaseRadius * Math.cos(perpAngleRad);
  const needleRightY = cy - needleBaseRadius * Math.sin(perpAngleRad);

  // Ticks calculation
  const tickSteps = [0, 25, 50, 75, 100];
  const ticks = tickSteps.map((tickVal) => {
    const angle = startAngle + (tickVal / 100) * angleRange;
    const innerP = polarToCartesian(cx, cy, radius - strokeWidth / 2 - 4, angle);
    const outerP = polarToCartesian(cx, cy, radius + strokeWidth / 2 + 4, angle);
    const textP = polarToCartesian(cx, cy, radius - 26, angle);
    return { tickVal, innerP, outerP, textP };
  });

  return (
    <div
      className={`relative flex flex-col items-center select-none ${
        interactive ? "transition-transform hover:scale-[1.01]" : ""
      }`}
      style={{ width: size }}
    >
      {/* Title / Metric Name */}
      {title && (
        <div className="text-center mb-1">
          <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {title}
          </div>
          {subtitle && (
            <div className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {subtitle}
            </div>
          )}
        </div>
      )}

      {/* SVG Radial Gauge */}
      <div className="relative w-full aspect-[280/190] max-h-[190px] flex items-center justify-center">
        <svg
          viewBox="0 0 280 190"
          className="w-full h-full overflow-visible drop-shadow-md"
          role="img"
          aria-label={`Virality Gauge Chart score: ${animatedScore} out of 100`}
        >
          <defs>
            {/* Background Arc Gradient */}
            <linearGradient id="gaugeBgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isDark ? "#1e293b" : "#e2e8f0"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={isDark ? "#334155" : "#cbd5e1"} stopOpacity="0.8" />
            </linearGradient>

            {/* Dynamic Active Arc Multi-Color Gradient */}
            <linearGradient id="gaugeActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />      {/* Blue */}
              <stop offset="30%" stopColor="#06b6d4" />     {/* Cyan */}
              <stop offset="60%" stopColor="#10b981" />     {/* Emerald */}
              <stop offset="85%" stopColor="#f59e0b" />     {/* Amber */}
              <stop offset="100%" stopColor="#f43f5e" />    {/* Rose */}
            </linearGradient>

            {/* Glowing filter */}
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Needle Gradient */}
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d={backgroundArcPath}
            fill="none"
            stroke="url(#gaugeBgGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Tick Lines */}
          {ticks.map((t) => (
            <g key={t.tickVal}>
              <line
                x1={t.innerP.x}
                y1={t.innerP.y}
                x2={t.outerP.x}
                y2={t.outerP.y}
                stroke={isDark ? "#475569" : "#94a3b8"}
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.6}
              />
              <text
                x={t.textP.x}
                y={t.textP.y + 3}
                fill={isDark ? "#64748b" : "#94a3b8"}
                fontSize="8"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {t.tickVal}
              </text>
            </g>
          ))}

          {/* Active Highlight Arc with Glow */}
          <path
            d={activeArcPath}
            fill="none"
            stroke="url(#gaugeActiveGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            className="transition-all duration-300"
          />

          {/* Pointer / Needle */}
          <polygon
            points={`${needleLeftX},${needleLeftY} ${needleTipX},${needleTipY} ${needleRightX},${needleRightY}`}
            fill="url(#needleGrad)"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
            className="transition-all duration-300"
          />

          {/* Needle Center Pivot Cap */}
          <circle
            cx={cx}
            cy={cy}
            r={11}
            fill={isDark ? "#0f172a" : "#ffffff"}
            stroke={isDark ? "#38bdf8" : "#2563eb"}
            strokeWidth={3}
            filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.4))"
          />
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill={isDark ? "#38bdf8" : "#2563eb"}
          />
        </svg>

        {/* Digital Readout Center Overlay */}
        <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-baseline gap-1">
            <span
              id="gauge-score-value"
              data-testid="gauge-score-value"
              className={`text-3xl sm:text-4xl font-black tracking-tight font-mono transition-colors ${
                status.colorClass
              }`}
            >
              {animatedScore}
            </span>
            <span className={`text-xs font-bold font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              /100
            </span>
          </div>

          {/* Tier Label Badge */}
          <div
            className={`mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase transition-all shadow-sm ${
              status.badgeBg
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-ping bg-current opacity-75" />
            <span>{status.label}</span>
          </div>

          {activeMetricName && (
            <div className={`text-[10px] font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {activeMetricName}
            </div>
          )}
        </div>
      </div>

      {/* Virality Zone Scale Legend */}
      <div className="w-full max-w-[260px] grid grid-cols-4 gap-1 mt-2 text-[9px] text-center font-medium">
        <div className={`py-0.5 px-1 rounded ${isDark ? "bg-slate-800/60 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
          0-40 Mod
        </div>
        <div className={`py-0.5 px-1 rounded ${isDark ? "bg-blue-950/60 text-blue-300 border border-blue-900/40" : "bg-blue-50 text-blue-700"}`}>
          41-75 High
        </div>
        <div className={`py-0.5 px-1 rounded ${isDark ? "bg-amber-950/60 text-amber-300 border border-amber-900/40" : "bg-amber-50 text-amber-700"}`}>
          76-89 Viral
        </div>
        <div className={`py-0.5 px-1 rounded ${isDark ? "bg-rose-950/60 text-rose-300 border border-rose-900/40" : "bg-rose-50 text-rose-700 font-bold"}`}>
          90+ Breakout
        </div>
      </div>
    </div>
  );
};
