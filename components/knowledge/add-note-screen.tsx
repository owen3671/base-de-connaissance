"use client";

import { useSearchParams } from "next/navigation";
import { QuickNoteForm } from "@/components/knowledge/quick-note-form";
import { useApp } from "@/components/providers/app-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export function AddNoteScreen() {
  const searchParams = useSearchParams();
  const { notes } = useApp();
  const editingId = searchParams.get("edit");
  const noteToEdit = editingId ? notes.find((note) => note.id === editingId) ?? null : null;

  if (editingId && !noteToEdit) {
    return (
      <>
        <PageHeader
          eyebrow="Edition"
          title="Fiche introuvable"
          description="La fiche a modifier n'est plus disponible. Vous pouvez en creer une nouvelle a la place."
        />
        <EmptyState
          actionHref="/ajouter"
          actionLabel="Creer une nouvelle fiche"
          description="La fiche demandee n'existe pas ou n'est pas encore chargee dans l'application."
          title="Impossible d'ouvrir cette fiche"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={noteToEdit ? "Modifier" : "Ajout rapide"}
        title={noteToEdit ? "Mettre a jour une fiche" : "Ajouter une fiche en quelques secondes"}
        description="Titre, idee cle, contenu, source et tags restent toujours accessibles en une seule page, sans friction inutile sur mobile."
      />
      <QuickNoteForm noteToEdit={noteToEdit} />
    </>
  );
}
