"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { FloatingAddButton } from "@/components/layout/floating-add-button";
import { Badge } from "@/components/ui/badge";
import { BookIcon, DatabaseIcon, LockIcon } from "@/components/ui/icons";
import { appName } from "@/lib/constants";
import { navigationItems } from "@/lib/navigation";
import { buildReviewGroups } from "@/lib/note-utils";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers/app-provider";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isSupabaseConfigured, notes, sourceMode, userEmail } = useApp();
  const activeItem =
    navigationItems.find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))) ??
    navigationItems[0];
  const reviewCount = buildReviewGroups(notes).find((group) => group.key === "today")?.notes.length ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(12,74,110,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.10),transparent_28%)]" />
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col lg:flex-row">
        <aside className="hidden w-[300px] shrink-0 border-r border-[var(--border)] bg-[rgba(255,255,255,0.78)] p-6 backdrop-blur lg:flex lg:flex-col">
          <div className="rounded-[1.8rem] border border-[var(--border)] bg-[linear-gradient(160deg,#0f172a,#12314a_55%,#0c4a6e)] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                <BookIcon className="h-5 w-5" />
              </div>
              <Badge tone={sourceMode === "supabase" ? "success" : "neutral"}>
                {sourceMode === "supabase" ? "Supabase actif" : "Mode local"}
              </Badge>
            </div>
            <h1 className="mt-4 text-2xl font-semibold">{appName}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Un second cerveau mobile-first pour capturer, filtrer et reviser vos fiches en quelques secondes.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-[1.35rem] border px-4 py-3 transition",
                    isActive
                      ? "border-[var(--accent)] bg-[rgba(12,74,110,0.10)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]",
                  )}
                >
                  <div className="text-sm font-semibold text-[var(--foreground)]">{item.label}</div>
                  <div className="mt-1 text-xs leading-5">{item.description}</div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 grid gap-3">
            <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--card-strong)] p-2 text-[var(--accent)]">
                  <DatabaseIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{notes.length} fiches</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {reviewCount} a revoir aujourd&apos;hui
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--card-strong)] p-2 text-[var(--accent)]">
                  <LockIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {isAuthenticated ? "Session active" : "Connexion optionnelle"}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {userEmail ?? (isSupabaseConfigured ? "Connectez-vous pour synchroniser" : "Supabase non configure")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(245,246,240,0.92)] px-4 py-4 backdrop-blur sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{appName}</p>
                <h1 className="mt-1 text-lg font-semibold text-[var(--foreground)]">{activeItem.label}</h1>
              </div>
              <Badge tone={sourceMode === "supabase" ? "success" : "neutral"}>
                {isLoading ? "Chargement" : sourceMode === "supabase" ? "Sync" : "Local"}
              </Badge>
            </div>
          </header>

          <main className="flex-1 px-4 pb-32 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>

      <FloatingAddButton />
      <BottomNavigation />
    </div>
  );
}
