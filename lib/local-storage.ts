import { demoNotes } from "@/data/demo-data";
import type { KnowledgeNote } from "@/types";

const notesStorageKey = "atlas-personnel-notes";

function cloneDemoNotes(): KnowledgeNote[] {
  return demoNotes.map((note) => ({
    ...note,
    tags: [...note.tags],
  }));
}

export function readLocalNotes(): KnowledgeNote[] {
  if (typeof window === "undefined") {
    return cloneDemoNotes();
  }

  const rawValue = window.localStorage.getItem(notesStorageKey);

  if (!rawValue) {
    const seededNotes = cloneDemoNotes();
    writeLocalNotes(seededNotes);
    return seededNotes;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as KnowledgeNote[];

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      const seededNotes = cloneDemoNotes();
      writeLocalNotes(seededNotes);
      return seededNotes;
    }

    return parsedValue;
  } catch {
    const seededNotes = cloneDemoNotes();
    writeLocalNotes(seededNotes);
    return seededNotes;
  }
}

export function writeLocalNotes(notes: KnowledgeNote[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(notesStorageKey, JSON.stringify(notes));
}
