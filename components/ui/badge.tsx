import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-[var(--card-strong)] text-[var(--muted-foreground)]",
  accent: "bg-[rgba(12,74,110,0.12)] text-[var(--accent)]",
  success: "bg-[rgba(22,101,52,0.12)] text-[#166534]",
  warning: "bg-[rgba(180,83,9,0.12)] text-[#b45309]",
  danger: "bg-[rgba(161,29,45,0.12)] text-[#a11d2d]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
