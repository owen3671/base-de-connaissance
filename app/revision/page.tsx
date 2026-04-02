"use client";

import { useState, useTransition } from "react";
import { NoteCard } from "@/components/knowledge/note-card";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buildReviewGroups } from "@/lib/note-utils";

export default function ReviewPage() {
  const { markNoteReviewed, notes } = useApp();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const reviewGroups = buildReviewGroups(notes);
  const totalReview = reviewGroups.reduce((count, group) => count + group.notes.length, 0);

  async function handleReview(noteId: string) {
    setPendingId(noteId);
    const result = await markNoteReviewed(noteId);

    if (!result.success) {
      setPendingId(null);
      return;
    }

    setPendingId(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Revision"
        title="Un systeme simple pour revoir ce qui compte"
        description="Les fiches sont classees en trois niveaux: aujourd'hui, bientot et plus tard. Un tap suffit pour les faire progresser."
      />

      <p className="text-sm text-[var(--muted-foreground)]">
        {totalReview} fiche(s) a reviser dans le flux actuel.
      </p>

      {totalReview === 0 ? (
        <EmptyState
          actionHref="/ajouter"
          actionLabel="Ajouter une fiche"
          description="Ajoutez une premiere note ou attendez le prochain contenu a memoriser."
          title="Aucune fiche a reviser"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {reviewGroups.map((group) => (
            <section key={group.key} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">{group.label}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{group.description}</p>
              </div>
              {group.notes.length === 0 ? (
                <EmptyState
                  description="Aucune fiche dans cette colonne pour le moment."
                  title={`Rien dans ${group.label.toLowerCase()}`}
                />
              ) : (
                group.notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    action={
                      <Button
                        disabled={isPending && pendingId === note.id}
                        onClick={() => {
                          startTransition(() => {
                            void handleReview(note.id);
                          });
                        }}
                      >
                        {isPending && pendingId === note.id ? "Mise a jour..." : "Marquer comme revise"}
                      </Button>
                    }
                  />
                ))
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
