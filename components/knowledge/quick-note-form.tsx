"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { noteCategories, sourceExamples, statusOptions, importanceOptions } from "@/lib/constants";
import {
  buildSummarySuggestion,
  buildTagSuggestions,
  createEmptyNoteDraft,
  parseTagsInput,
  stringifyTags,
} from "@/lib/note-utils";
import type { KnowledgeNote } from "@/types";

interface QuickNoteFormProps {
  noteToEdit?: KnowledgeNote | null;
}

export function QuickNoteForm({ noteToEdit = null }: QuickNoteFormProps) {
  const router = useRouter();
  const { saveNote, sourceMode } = useApp();
  const [draft, setDraft] = useState(() =>
    noteToEdit
      ? {
          title: noteToEdit.title,
          category: noteToEdit.category,
          subcategory: noteToEdit.subcategory,
          summary: noteToEdit.summary,
          key_idea: noteToEdit.key_idea,
          content: noteToEdit.content,
          example: noteToEdit.example,
          source: noteToEdit.source,
          tags: noteToEdit.tags,
          importance: noteToEdit.importance,
          status: noteToEdit.status,
        }
      : createEmptyNoteDraft(),
  );
  const [tagsInput, setTagsInput] = useState(() => stringifyTags(noteToEdit?.tags ?? []));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!noteToEdit) {
      setDraft(createEmptyNoteDraft());
      setTagsInput("");
      return;
    }

    setDraft({
      title: noteToEdit.title,
      category: noteToEdit.category,
      subcategory: noteToEdit.subcategory,
      summary: noteToEdit.summary,
      key_idea: noteToEdit.key_idea,
      content: noteToEdit.content,
      example: noteToEdit.example,
      source: noteToEdit.source,
      tags: noteToEdit.tags,
      importance: noteToEdit.importance,
      status: noteToEdit.status,
    });
    setTagsInput(stringifyTags(noteToEdit.tags));
  }, [noteToEdit]);

  function updateDraft<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await saveNote({
          ...draft,
          id: noteToEdit?.id,
          tags: parseTagsInput(tagsInput),
        });

        if (!result.success || !result.note) {
          setFeedback(result.error ?? "Impossible de sauvegarder cette fiche.");
          return;
        }

        router.push(`/notes/${result.note.id}`);
      })();
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={sourceMode === "supabase" ? "success" : "neutral"}>
            {sourceMode === "supabase" ? "Sauvegarde Supabase" : "Sauvegarde locale"}
          </Badge>
          <p className="text-sm text-[var(--muted-foreground)]">
            Formulaire pense pour une capture rapide depuis telephone.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Titre" required>
            <Input
              maxLength={140}
              onChange={(event) => updateDraft("title", event.target.value)}
              placeholder="Ex. L'effet Lindy comme filtre de robustesse"
              value={draft.title}
            />
          </Field>

          <Field label="Categorie" required>
            <Select onChange={(event) => updateDraft("category", event.target.value as typeof draft.category)} value={draft.category}>
              {noteCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Sous-categorie">
            <Input
              onChange={(event) => updateDraft("subcategory", event.target.value)}
              placeholder="Ex. Geoeconomie, heuristiques, monnaie..."
              value={draft.subcategory}
            />
          </Field>

          <Field label="Source">
            <Input
              list="source-examples"
              onChange={(event) => updateDraft("source", event.target.value)}
              placeholder="Podcast, video, livre..."
              value={draft.source}
            />
            <datalist id="source-examples">
              {sourceExamples.map((source) => (
                <option key={source} value={source} />
              ))}
            </datalist>
          </Field>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Contenu de la fiche</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Gardez l'essentiel, puis enrichissez plus tard si besoin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-10"
              onClick={() => updateDraft("summary", buildSummarySuggestion(draft))}
              size="sm"
              type="button"
              variant="secondary"
            >
              Generer un resume
            </Button>
            <Button
              className="min-h-10"
              onClick={() => setTagsInput(stringifyTags(buildTagSuggestions(draft)))}
              size="sm"
              type="button"
              variant="secondary"
            >
              Suggérer des tags
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <Field label="Resume court">
            <Textarea
              onChange={(event) => updateDraft("summary", event.target.value)}
              placeholder="Ce que je dois retenir en une ou deux phrases."
              rows={3}
              value={draft.summary}
            />
          </Field>

          <Field label="Idee cle" required>
            <Textarea
              onChange={(event) => updateDraft("key_idea", event.target.value)}
              placeholder="La phrase la plus importante a memoriser."
              rows={3}
              value={draft.key_idea}
            />
          </Field>

          <Field label="Contenu / notes">
            <Textarea
              className="min-h-40"
              onChange={(event) => updateDraft("content", event.target.value)}
              placeholder="Notes detaillees, contexte, nuances, arguments..."
              rows={6}
              value={draft.content}
            />
          </Field>

          <Field label="Exemple concret">
            <Textarea
              onChange={(event) => updateDraft("example", event.target.value)}
              placeholder="Un cas, une analogie ou une mise en situation pour mieux retenir."
              rows={4}
              value={draft.example}
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Tags">
            <Input
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="memoire, risque, diplomatie"
              value={tagsInput}
            />
          </Field>

          <Field label="Importance">
            <Select
              onChange={(event) => updateDraft("importance", event.target.value as typeof draft.importance)}
              value={draft.importance}
            >
              {importanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Statut">
            <Select onChange={(event) => updateDraft("status", event.target.value as typeof draft.status)} value={draft.status}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+6rem)] z-10 rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur lg:bottom-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {noteToEdit ? "Mettre a jour la fiche" : "Ajouter la fiche"}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              1 a 2 clics max pour capturer une idee et revenir plus tard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {feedback ? <p className="self-center text-sm text-[#a11d2d]">{feedback}</p> : null}
            <Button disabled={isPending} size="lg" type="submit">
              {isPending ? "Sauvegarde..." : noteToEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
