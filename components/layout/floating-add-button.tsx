"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon } from "@/components/ui/icons";

export function FloatingAddButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/ajouter")) {
    return null;
  }

  return (
    <Link
      aria-label="Ajouter une fiche"
      href="/ajouter"
      className="fixed bottom-[6.75rem] right-4 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_20px_45px_rgba(12,74,110,0.3)] transition hover:bg-[var(--accent-strong)] lg:bottom-8 lg:right-8"
    >
      <PlusIcon className="h-6 w-6" />
    </Link>
  );
}
