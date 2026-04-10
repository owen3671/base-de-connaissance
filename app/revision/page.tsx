"use client";

import { useState, useTransition } from "react";
import { NoteCard } from "@/components/knowledge/note-card";
import { ReviewCalendar } from "@/components/knowledge/review-calendar";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  buildReviewCalendar,
  buildReviewGroups,
  formatCalendarDateKey,
  formatCalendarLongDate,
  parseCalendarDateKey,
  shiftCalendarMonth,
} from "@/lib/note-utils";

export default function ReviewPage() {
  const { markNoteReviewed, notes } = useApp();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [focusedMonth, setFocusedMonth] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatCalendarDateKey(new Date()));
  const reviewGroups = buildReviewGroups(notes);
  const reviewCalendar = buildReviewCalendar(notes, focusedMonth);
  const selectedDay = reviewCalendar.days.find((day) => day.key === selectedDateKey);
  const selectedNotes = selectedDay?.notes ?? [];
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
        description="Consultez vos revisions dans un calendrier mensuel, puis gardez la vue rapide par priorite juste en dessous."
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
        <div className="space-y-8">
          <ReviewCalendar
            calendar={reviewCalendar}
            selectedDateKey={selectedDateKey}
            onPreviousMonth={() => {
              const nextMonth = shiftCalendarMonth(focusedMonth, -1);
              setFocusedMonth(nextMonth);
              setSelectedDateKey(formatCalendarDateKey(nextMonth));
            }}
            onNextMonth={() => {
              const nextMonth = shiftCalendarMonth(focusedMonth, 1);
              setFocusedMonth(nextMonth);
              setSelectedDateKey(formatCalendarDateKey(nextMonth));
            }}
            onSelectDate={(dateKey) => {
              const selectedDate = parseCalendarDateKey(dateKey);
              setSelectedDateKey(dateKey);

              if (
                selectedDate.getMonth() !== focusedMonth.getMonth() ||
                selectedDate.getFullYear() !== focusedMonth.getFullYear()
              ) {
                setFocusedMonth(selectedDate);
              }
            }}
          />

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {formatCalendarLongDate(selectedDateKey)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {selectedNotes.length > 0
                  ? `${selectedNotes.length} fiche(s) prevue(s) pour cette date.`
                  : "Aucune fiche prevue pour cette date."}
              </p>
            </div>

            {selectedNotes.length === 0 ? (
              <EmptyState
                description="Choisissez un autre jour ou continuez avec la vue par priorite plus bas."
                title="Aucune revision ce jour-la"
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {selectedNotes.map((note) => (
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
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Vue par priorite</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Gardez aussi le tri rapide par aujourd&apos;hui, bientot et plus tard.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {reviewGroups.map((group) => (
                <section key={group.key} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">{group.label}</h3>
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
          </section>
        </div>
      )}
    </>
  );
}
