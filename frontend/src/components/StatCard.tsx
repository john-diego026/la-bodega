import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "purple" | "cyan" | "amber" | "red";
}

const variants = {
  purple: {
    bg: "bg-purple-950/20 border-purple-500/30",
    iconBg: "bg-purple-500/20 text-purple-400",
    textGlow: "text-purple-300",
  },
  cyan: {
    bg: "bg-cyan-950/20 border-cyan-500/30",
    iconBg: "bg-cyan-500/20 text-cyan-400",
    textGlow: "text-cyan-300",
  },
  amber: {
    bg: "bg-amber-950/20 border-amber-500/30",
    iconBg: "bg-amber-500/20 text-amber-400",
    textGlow: "text-amber-300",
  },
  red: {
    bg: "bg-red-950/20 border-red-500/40 glow-red",
    iconBg: "bg-red-500/20 text-red-400 animate-pulse",
    textGlow: "text-red-400",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "purple",
}: StatCardProps) {
  const currentVariant = variants[variant];

  return (
    <div
      className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${currentVariant.bg}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-medium mb-1">
            {title}
          </p>
          <h3 className={`text-3xl font-extrabold ${currentVariant.textGlow}`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-1 font-mono">{subtitle}</p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl border border-white/5 ${currentVariant.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
