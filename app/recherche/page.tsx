"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { NoteCard } from "@/components/knowledge/note-card";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { importanceOptions, noteCategories, statusOptions } from "@/lib/constants";
import { filterNotes } from "@/lib/note-utils";
import type { NoteFilters } from "@/types";

const defaultFilters: NoteFilters = {
  query: "",
  category: "all",
  importance: "all",
  status: "all",
  sort: "recent",
};

export default function SearchPage() {
  const { notes } = useApp();
  const [filters, setFilters] = useState<NoteFilters>(defaultFilters);
  const deferredQuery = useDeferredValue(filters.query);
  const filteredNotes = filterNotes(notes, {
    ...filters,
    query: deferredQuery,
  });

  function updateFilters<K extends keyof NoteFilters>(key: K, value: NoteFilters[K]) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }

  return (
    <>
      <PageHeader
        eyebrow="Recherche"
        title="Retrouver une fiche sans perdre de temps"
        description="Filtrez par categorie, importance, statut ou mots-cles. La recherche fonctionne sur le titre, le contenu, la source et les tags."
        actions={
          <Link href="/ajouter">
            <Button variant="secondary">Nouvelle fiche</Button>
          </Link>
        }
      />

      <div className="grid gap-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 lg:grid-cols-5">
        <Field label="Recherche">
          <Input
            onChange={(event) => updateFilters("query", event.target.value)}
            placeholder="Podcast, monnaie, Taleb, diplomatie..."
            value={filters.query}
          />
        </Field>

        <Field label="Categorie">
          <Select onChange={(event) => updateFilters("category", event.target.value as NoteFilters["category"])} value={filters.category}>
            <option value="all">Toutes</option>
            {noteCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Importance">
          <Select
            onChange={(event) => updateFilters("importance", event.target.value as NoteFilters["importance"])}
            value={filters.importance}
          >
            <option value="all">Toutes</option>
            {importanceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Statut">
          <Select onChange={(event) => updateFilters("status", event.target.value as NoteFilters["status"])} value={filters.status}>
            <option value="all">Tous</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tri">
          <Select onChange={(event) => updateFilters("sort", event.target.value as NoteFilters["sort"])} value={filters.sort}>
            <option value="recent">Plus recentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="importance">Importance</option>
          </Select>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          {filteredNotes.length} fiche(s) correspondent a votre recherche.
        </p>
        <Button onClick={() => setFilters(defaultFilters)} variant="ghost">
          Reinitialiser
        </Button>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState
          actionHref="/ajouter"
          actionLabel="Ajouter une fiche"
          description="Essayez un autre mot-cle ou videz les filtres pour repartir d'une liste complete."
          title="Aucun resultat"
        />
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </>
  );
}
