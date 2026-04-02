"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { NoteCard } from "@/components/knowledge/note-card";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import {
  buildQuizItems,
  buildRelatedNotes,
  formatNoteDate,
  getImportanceLabel,
  getStatusLabel,
} from "@/lib/note-utils";

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { deleteNote, notes } = useApp();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const note = notes.find((item) => item.id === params.id);

  if (!note) {
    return (
      <>
        <PageHeader
          eyebrow="Fiche"
          title="Fiche introuvable"
          description="Cette fiche n'est plus disponible ou n'a pas encore ete synchronisee."
        />
        <EmptyState
          actionHref="/recherche"
          actionLabel="Retour a la recherche"
          description="Revenez a la liste des fiches pour continuer votre navigation."
          title="Impossible d'afficher cette fiche"
        />
      </>
    );
  }

  const quizItems = buildQuizItems(note);
  const relatedNotes = buildRelatedNotes(note, notes);

  return (
    <>
      <PageHeader
        eyebrow={note.category}
        title={note.title}
        description={note.summary || note.key_idea}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href={`/ajouter?edit=${note.id}`}>
              <Button variant="secondary">
                <EditIcon className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </Link>
            <Button
              onClick={() => {
                setFeedback(null);
                startTransition(() => {
                  void (async () => {
                    const result = await deleteNote(note.id);

                    if (!result.success) {
                      setFeedback(result.error ?? "Suppression impossible.");
                      return;
                    }

                    router.push("/recherche");
                  })();
                });
              }}
              variant="danger"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{note.category}</Badge>
        <Badge tone="warning">{getImportanceLabel(note.importance)}</Badge>
        <Badge tone={note.status === "maitrise" ? "success" : "accent"}>{getStatusLabel(note.status)}</Badge>
        <Badge>{formatNoteDate(note.updated_at)}</Badge>
      </div>

      {feedback ? <p className="text-sm text-[#a11d2d]">{feedback}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Resume</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">{note.summary || "Aucun resume renseigne."}</p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Idee cle</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">{note.key_idea || "Aucune idee cle renseignee."}</p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Contenu</h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--muted-foreground)]">
              {note.content || "Aucune note detaillee pour le moment."}
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Exemple concret</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">{note.example || "Aucun exemple renseigne."}</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {note.tags.length > 0 ? note.tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : <p className="text-sm text-[var(--muted-foreground)]">Aucun tag pour le moment.</p>}
            </div>
            <div className="rounded-[1.2rem] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              <p>Source: {note.source || "A preciser"}</p>
              <p>Creation: {formatNoteDate(note.created_at)}</p>
              <p>Derniere mise a jour: {formatNoteDate(note.updated_at)}</p>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Mini quiz</h2>
            <div className="space-y-3">
              {quizItems.map((item) => (
                <div key={item.question} className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.question}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Fiches liees par categorie ou tags</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Suggestion automatique</p>
        </div>
        {relatedNotes.length === 0 ? (
          <EmptyState description="Aucune autre fiche proche pour le moment." title="Pas encore de fiche liee" />
        ) : (
          <div className="space-y-4">
            {relatedNotes.map((relatedNote) => (
              <NoteCard key={relatedNote.id} note={relatedNote} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
