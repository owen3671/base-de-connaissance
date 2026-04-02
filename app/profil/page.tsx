"use client";

import { useTransition } from "react";
import { AuthPanel } from "@/components/knowledge/auth-panel";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function ProfilePage() {
  const { isSupabaseConfigured, notes, refreshNotes, sourceMode, userEmail } = useApp();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <PageHeader
        eyebrow="Profil"
        title="Synchronisation, auth et mode local"
        description="L'app reste utilisable sans API grace au mode local, tout en etant connectee a Supabase pour la synchronisation et l'authentification."
        actions={
          <Button
            onClick={() => {
              startTransition(() => {
                void refreshNotes();
              });
            }}
            variant="secondary"
          >
            {isPending ? "Actualisation..." : "Actualiser"}
          </Button>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge tone={sourceMode === "supabase" ? "success" : "neutral"}>
              {sourceMode === "supabase" ? "Supabase" : "Local"}
            </Badge>
            <p className="text-sm text-[var(--muted-foreground)]">{notes.length} fiche(s) disponibles</p>
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Etat de la base</h2>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            {sourceMode === "supabase"
              ? `Les donnees sont actuellement synchronisees pour ${userEmail ?? "votre compte"}.`
              : "Les donnees sont stockees en local sur cet appareil pour garder un mode demo fonctionnel."}
          </p>
          {!isSupabaseConfigured ? (
            <div className="rounded-[1.2rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Configurez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`, puis executez le schema SQL fourni dans `supabase/schema.sql`.
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Projet connecte : `hjcrjncmcsjqtimiccdb.supabase.co`
            </div>
          )}
        </Card>

        <AuthPanel />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Pourquoi garder un mode local ?</h2>
          <div className="space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <p>L'app reste demonstrable sans compte ni base distante.</p>
            <p>Le developpement mobile-first reste testable hors connexion.</p>
            <p>La migration vers une vraie base Supabase ne casse pas l'UX de capture rapide.</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Acces rapide</h2>
          <div className="space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <p>1. Utilisez le compte demo deja configure depuis le panneau de droite.</p>
            <p>2. Les 8 fiches de demonstration sont deja chargees dans Supabase.</p>
            <p>3. Vous pouvez aussi creer votre propre compte depuis cette page.</p>
            <p>4. Les donnees restent consultables en mode local si vous vous deconnectez.</p>
          </div>
        </Card>
      </section>
    </>
  );
}
