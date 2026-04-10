"use client";

import { useEffect, useState } from "react";
import { PlannerCalendar } from "@/components/planner/planner-calendar";
import { PlannerForm } from "@/components/planner/planner-form";
import { PlannerItemCard } from "@/components/planner/planner-item-card";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CalendarIcon } from "@/components/ui/icons";
import {
  buildPlannerDraftFromItem,
  buildPlannerMonth,
  buildPlannerTimeline,
  createEmptyPlannerItemDraft,
  formatPlannerToolbarLabel,
  getPlannerDateValue,
  getPlannerViewLabel,
  shiftPlannerViewDate,
} from "@/lib/planner-utils";
import type { PlannerItem, PlannerView, SavePlannerItemPayload } from "@/types";

type FeedbackTone = "neutral" | "success" | "danger";

export default function CalendarPage() {
  const { deletePlannerItem, plannerItems, savePlannerItem, togglePlannerItemStatus } = useApp();
  const [view, setView] = useState<PlannerView>("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [draft, setDraft] = useState<SavePlannerItemPayload>(() => createEmptyPlannerItemDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null);

  const selectedDateKey = getPlannerDateValue(selectedDate);
  const monthCalendar = buildPlannerMonth(plannerItems, selectedDate);
  const visibleTimeline = buildPlannerTimeline(plannerItems, selectedDate, view === "month" ? "day" : view);
  const todayItems = buildPlannerTimeline(plannerItems, new Date(), "day")[0]?.items ?? [];
  const weekItemsCount = buildPlannerTimeline(plannerItems, selectedDate, "week").reduce(
    (count, day) => count + day.items.length,
    0,
  );
  const monthItemsCount = plannerItems.filter((item) => {
    const itemDate = new Date(item.starts_at);
    return (
      itemDate.getMonth() === selectedDate.getMonth() &&
      itemDate.getFullYear() === selectedDate.getFullYear()
    );
  }).length;

  useEffect(() => {
    setDraft((currentDraft) =>
      currentDraft.id ? currentDraft : { ...currentDraft, date: selectedDateKey },
    );
  }, [selectedDateKey]);

  function resetForm(nextDate = selectedDateKey) {
    setEditingId(null);
    setDraft(createEmptyPlannerItemDraft(nextDate));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setFeedback(null);

    const result = await savePlannerItem(draft);

    if (!result.success) {
      setFeedback({
        tone: "danger",
        message: result.error ?? "Impossible d'enregistrer ce creneau.",
      });
      setIsSubmitting(false);
      return;
    }

    if (result.plannerItem) {
      setSelectedDate(new Date(result.plannerItem.starts_at));
      resetForm(getPlannerDateValue(new Date(result.plannerItem.starts_at)));
    } else {
      resetForm();
    }

    setFeedback({
      tone: "success",
      message: editingId ? "Creneau mis a jour." : "Creneau ajoute au calendrier.",
    });
    setIsSubmitting(false);
  }

  function handleEdit(item: PlannerItem) {
    setEditingId(item.id);
    setDraft(buildPlannerDraftFromItem(item));
    setSelectedDate(new Date(item.starts_at));
    setView("day");
    setFeedback(null);
  }

  async function handleDelete(item: PlannerItem) {
    const confirmed = window.confirm(`Supprimer "${item.title}" du calendrier ?`);

    if (!confirmed) {
      return;
    }

    setBusyItemId(item.id);
    setFeedback(null);

    const result = await deletePlannerItem(item.id);

    if (!result.success) {
      setFeedback({
        tone: "danger",
        message: result.error ?? "Suppression impossible pour le moment.",
      });
      setBusyItemId(null);
      return;
    }

    if (editingId === item.id) {
      resetForm();
    }

    setFeedback({
      tone: "success",
      message: "Creneau supprime.",
    });
    setBusyItemId(null);
  }

  async function handleToggleStatus(item: PlannerItem) {
    setBusyItemId(item.id);
    setFeedback(null);

    const result = await togglePlannerItemStatus(item.id);

    if (!result.success) {
      setFeedback({
        tone: "danger",
        message: result.error ?? "Impossible de changer le statut.",
      });
      setBusyItemId(null);
      return;
    }

    setFeedback({
      tone: "success",
      message: item.status === "termine" ? "Creneau remis en cours." : "Creneau marque termine.",
    });
    setBusyItemId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendrier"
        title="Organisez votre journee, votre semaine et votre mois"
        description="Ajoutez vos taches, rendez-vous, revisions et objectifs dans une vue simple, rapide et lisible sur mobile comme sur desktop."
        actions={<Badge tone="accent">{plannerItems.length} element(s)</Badge>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Aujourd&apos;hui
          </p>
          <p className="text-3xl font-semibold text-[var(--foreground)]">{todayItems.length}</p>
          <p className="text-sm text-[var(--muted-foreground)]">Creneaux planifies pour la journee.</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Semaine
          </p>
          <p className="text-3xl font-semibold text-[var(--foreground)]">{weekItemsCount}</p>
          <p className="text-sm text-[var(--muted-foreground)]">Elements visibles autour de la date choisie.</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Mois
          </p>
          <p className="text-3xl font-semibold text-[var(--foreground)]">{monthItemsCount}</p>
          <p className="text-sm text-[var(--muted-foreground)]">Total du mois actuellement affiche.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  Navigation
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  {formatPlannerToolbarLabel(selectedDate, view)}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["day", "week", "month"] as PlannerView[]).map((currentView) => (
                  <Button
                    key={currentView}
                    size="sm"
                    variant={view === currentView ? "primary" : "secondary"}
                    onClick={() => setView(currentView)}
                  >
                    {getPlannerViewLabel(currentView)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedDate(shiftPlannerViewDate(selectedDate, view, -1))}
              >
                Prec.
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setSelectedDate(new Date())}>
                Aujourd&apos;hui
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedDate(shiftPlannerViewDate(selectedDate, view, 1))}
              >
                Suiv.
              </Button>
            </div>
          </Card>

          {view === "month" ? (
            <PlannerCalendar
              calendar={monthCalendar}
              selectedDateKey={selectedDateKey}
              onPreviousMonth={() => setSelectedDate(shiftPlannerViewDate(selectedDate, "month", -1))}
              onNextMonth={() => setSelectedDate(shiftPlannerViewDate(selectedDate, "month", 1))}
              onSelectDate={(dateKey) => setSelectedDate(new Date(`${dateKey}T12:00:00`))}
            />
          ) : null}

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {view === "month" ? "Selection du jour" : `Vue ${getPlannerViewLabel(view).toLowerCase()}`}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {view === "month"
                  ? "Touchez un jour du mois pour afficher son contenu juste en dessous."
                  : "Consultez rapidement vos creneaux et modifiez-les sans quitter la page."}
              </p>
            </div>

            {visibleTimeline.every((day) => day.items.length === 0) ? (
              <EmptyState
                title="Aucun creneau sur cette plage"
                description="Ajoutez votre premiere tache ou deplacez-vous sur une autre date pour remplir votre agenda."
                icon={<CalendarIcon className="h-5 w-5" />}
              />
            ) : (
              <div className="space-y-4">
                {visibleTimeline.map((day) => (
                  <Card key={day.key} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">{day.label}</h3>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {day.items.length === 0
                            ? "Aucun element ce jour-la."
                            : `${day.items.length} element(s) programme(s).`}
                        </p>
                      </div>
                      {day.isToday ? <Badge tone="accent">Aujourd&apos;hui</Badge> : null}
                    </div>

                    {day.items.length === 0 ? (
                      <div className="rounded-[1.1rem] border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
                        Rien de prevu pour cette date.
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {day.items.map((item) => (
                          <PlannerItemCard
                            key={item.id}
                            item={item}
                            isBusy={busyItemId === item.id}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <PlannerForm
            draft={draft}
            isEditing={Boolean(editingId)}
            isSubmitting={isSubmitting}
            onChange={setDraft}
            onSubmit={() => {
              void handleSubmit();
            }}
            onReset={() => resetForm()}
          />

          {feedback ? (
            <Card className="space-y-2">
              <Badge tone={feedback.tone}>{feedback.tone === "danger" ? "Erreur" : "Info"}</Badge>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{feedback.message}</p>
            </Card>
          ) : null}

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              Conseils
            </p>
            <div className="space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
              <p>Gardez les titres courts pour retrouver l&apos;agenda du jour en un coup d&apos;oeil.</p>
              <p>Utilisez le type `Revision` pour separer vos sessions d&apos;apprentissage du reste.</p>
              <p>Le formulaire reste disponible en mode local et se synchronise automatiquement si vous etes connecte.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
