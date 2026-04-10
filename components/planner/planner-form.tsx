"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SavePlannerItemPayload } from "@/types";

interface PlannerFormProps {
  draft: SavePlannerItemPayload;
  isEditing: boolean;
  isSubmitting: boolean;
  onChange: (nextDraft: SavePlannerItemPayload) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function PlannerForm({
  draft,
  isEditing,
  isSubmitting,
  onChange,
  onSubmit,
  onReset,
}: PlannerFormProps) {
  return (
    <Card className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Ajout rapide
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
          {isEditing ? "Modifier un creneau" : "Ajouter un creneau"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Planifiez une tache, un rendez-vous, une revision ou un objectif en quelques secondes.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Titre" required>
          <Input
            placeholder="Lecture, appel, podcast, revision..."
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
          />
        </Field>

        <Field label="Date" required>
          <Input
            type="date"
            value={draft.date}
            onChange={(event) => onChange({ ...draft, date: event.target.value })}
          />
        </Field>

        <label className="flex items-center gap-3 rounded-[1.1rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <input
            type="checkbox"
            checked={draft.all_day}
            onChange={(event) => onChange({ ...draft, all_day: event.target.checked })}
          />
          <span className="text-sm font-medium text-[var(--foreground)]">Toute la journee</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Debut" required={!draft.all_day}>
            <Input
              type="time"
              disabled={draft.all_day}
              value={draft.all_day ? "" : draft.start_time}
              onChange={(event) => onChange({ ...draft, start_time: event.target.value })}
            />
          </Field>

          <Field label="Fin">
            <Input
              type="time"
              disabled={draft.all_day}
              value={draft.all_day ? "" : draft.end_time}
              onChange={(event) => onChange({ ...draft, end_time: event.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select
              value={draft.item_type}
              onChange={(event) =>
                onChange({
                  ...draft,
                  item_type: event.target.value as SavePlannerItemPayload["item_type"],
                })
              }
            >
              <option value="tache">Tache</option>
              <option value="rendez_vous">Rendez-vous</option>
              <option value="revision">Revision</option>
              <option value="objectif">Objectif</option>
            </Select>
          </Field>

          <Field label="Statut">
            <Select
              value={draft.status}
              onChange={(event) =>
                onChange({
                  ...draft,
                  status: event.target.value as SavePlannerItemPayload["status"],
                })
              }
            >
              <option value="planifie">Planifie</option>
              <option value="termine">Termine</option>
            </Select>
          </Field>
        </div>

        <Field label="Notes">
          <Textarea
            placeholder="Ce que vous voulez accomplir, contexte, lien avec une fiche..."
            value={draft.details}
            onChange={(event) => onChange({ ...draft, details: event.target.value })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="flex-1 sm:flex-none" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre a jour" : "Ajouter au calendrier"}
        </Button>
        <Button className="flex-1 sm:flex-none" disabled={isSubmitting} variant="secondary" onClick={onReset}>
          {isEditing ? "Annuler la modification" : "Vider"}
        </Button>
      </div>
    </Card>
  );
}
