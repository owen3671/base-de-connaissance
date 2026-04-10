import { demoNotes, demoPlannerItems } from "@/data/demo-data";
import type { KnowledgeNote, PlannerItem } from "@/types";

const notesStorageKey = "atlas-personnel-notes";
const plannerStorageKey = "atlas-personnel-planner-items";

function cloneDemoNotes(): KnowledgeNote[] {
  return demoNotes.map((note) => ({
    ...note,
    tags: [...note.tags],
  }));
}

function cloneDemoPlannerItems(): PlannerItem[] {
  return demoPlannerItems.map((item) => ({
    ...item,
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

export function readLocalPlannerItems(): PlannerItem[] {
  if (typeof window === "undefined") {
    return cloneDemoPlannerItems();
  }

  const rawValue = window.localStorage.getItem(plannerStorageKey);

  if (!rawValue) {
    const seededItems = cloneDemoPlannerItems();
    writeLocalPlannerItems(seededItems);
    return seededItems;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as PlannerItem[];

    if (!Array.isArray(parsedValue)) {
      const seededItems = cloneDemoPlannerItems();
      writeLocalPlannerItems(seededItems);
      return seededItems;
    }

    return parsedValue;
  } catch {
    const seededItems = cloneDemoPlannerItems();
    writeLocalPlannerItems(seededItems);
    return seededItems;
  }
}

export function writeLocalPlannerItems(items: PlannerItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(plannerStorageKey, JSON.stringify(items));
}
