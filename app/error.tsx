"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-[1.8rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Erreur locale</p>
        <h2 className="mt-4 text-3xl font-semibold text-[var(--foreground)]">Une erreur est survenue</h2>
        <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
          La page a rencontre un probleme inattendu. Vous pouvez relancer cette vue sans redemarrer toute l&apos;application.
        </p>
        <Button className="mt-6" onClick={reset} size="lg">
          Reessayer
        </Button>
      </div>
    </div>
  );
}
