import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)]",
        className,
      )}
      {...props}
    />
  );
}
