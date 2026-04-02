import { Suspense } from "react";
import { AddNoteScreen } from "@/components/knowledge/add-note-screen";
import { Card } from "@/components/ui/card";

export default function AddNotePage() {
  return (
    <Suspense
      fallback={
        <Card>
          <p className="text-sm text-[var(--muted-foreground)]">Chargement du formulaire...</p>
        </Card>
      }
    >
      <AddNoteScreen />
    </Suspense>
  );
}
