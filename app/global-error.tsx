"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import "./globals.css";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-[1.8rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Erreur globale</p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--foreground)]">
              L&apos;application doit etre rechargee
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
              Une erreur plus large que la page courante a ete detectee. Rechargez proprement l&apos;interface pour repartir sur une base saine.
            </p>
            <Button className="mt-6" onClick={reset} size="lg">
              Recharger l&apos;application
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
