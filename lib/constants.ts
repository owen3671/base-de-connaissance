import type { NoteCategory, NoteImportance, NoteStatus } from "@/types";

export const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Atlas Personnel";

export const noteCategories: NoteCategory[] = [
  "Podcasts",
  "Culture G",
  "Geopolitique",
  "Economie",
  "Histoire",
  "Concepts",
  "Citations",
  "Revisions",
];

export const importanceOptions: Array<{ value: NoteImportance; label: string }> = [
  { value: "faible", label: "Faible" },
  { value: "moyen", label: "Moyen" },
  { value: "eleve", label: "Eleve" },
];

export const statusOptions: Array<{ value: NoteStatus; label: string }> = [
  { value: "a_apprendre", label: "A apprendre" },
  { value: "en_cours", label: "En cours" },
  { value: "maitrise", label: "Maitrise" },
];

export const sourceExamples = [
  "Podcast",
  "Video YouTube",
  "Livre",
  "Article",
  "Cours",
  "Discussion",
  "Conference",
];
