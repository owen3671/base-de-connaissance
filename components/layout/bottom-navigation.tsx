"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  HomeIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { navigationItems } from "@/lib/navigation";
import { buildReviewGroups } from "@/lib/note-utils";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers/app-provider";

const iconMap = {
  "/": HomeIcon,
  "/ajouter": PlusIcon,
  "/recherche": SearchIcon,
  "/revision": RefreshIcon,
  "/profil": UserIcon,
};

export function BottomNavigation() {
  const pathname = usePathname();
  const { notes } = useApp();
  const todayCount = buildReviewGroups(notes).find((group) => group.key === "today")?.notes.length ?? 0;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[rgba(255,255,255,0.92)] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] px-2 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        {navigationItems.map((item) => {
          const Icon = iconMap[item.href as keyof typeof iconMap];
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 text-[11px] font-semibold transition",
                isActive
                  ? "bg-[rgba(12,74,110,0.10)] text-[var(--accent)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.shortLabel}</span>
              {item.href === "/revision" && todayCount > 0 ? (
                <Badge className="absolute right-2 top-1 px-2 py-0.5" tone="warning">
                  {todayCount}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
