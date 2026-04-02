import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-[1.8rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Page introuvable</p>
        <h2 className="mt-4 text-3xl font-semibold text-[var(--foreground)]">
          Cette page n&apos;existe pas ou n&apos;est plus disponible
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
          Revenez a l&apos;accueil pour continuer a naviguer dans votre base de connaissances.
        </p>
        <Link href="/" className="mt-6 inline-flex">
          <Button size="lg">Retour a l&apos;accueil</Button>
        </Link>
      </div>
    </div>
  );
}
