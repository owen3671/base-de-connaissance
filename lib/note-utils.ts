import type {
  CategoryCount,
  DashboardData,
  KnowledgeNote,
  KnowledgeNoteDraft,
  NoteFilters,
  NoteImportance,
  NoteStatus,
  NotesSort,
  QuizItem,
  ReviewBucket,
  ReviewGroup,
} from "@/types";

const importanceWeight: Record<NoteImportance, number> = {
  faible: 1,
  moyen: 2,
  eleve: 3,
};

const collator = new Intl.Collator("fr-FR");

export function createEmptyNoteDraft(): KnowledgeNoteDraft {
  return {
    title: "",
    category: "Podcasts",
    subcategory: "",
    summary: "",
    key_idea: "",
    content: "",
    example: "",
    source: "",
    tags: [],
    importance: "moyen",
    status: "a_apprendre",
  };
}

export function sortNotes(notes: KnowledgeNote[], sort: NotesSort): KnowledgeNote[] {
  const copiedNotes = [...notes];

  copiedNotes.sort((leftNote, rightNote) => {
    if (sort === "importance") {
      const byImportance = importanceWeight[rightNote.importance] - importanceWeight[leftNote.importance];

      if (byImportance !== 0) {
        return byImportance;
      }
    }

    if (sort === "oldest") {
      return Date.parse(leftNote.updated_at) - Date.parse(rightNote.updated_at);
    }

    return Date.parse(rightNote.updated_at) - Date.parse(leftNote.updated_at);
  });

  return copiedNotes;
}

export function filterNotes(notes: KnowledgeNote[], filters: NoteFilters): KnowledgeNote[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return sortNotes(
    notes.filter((note) => {
      if (filters.category !== "all" && note.category !== filters.category) {
        return false;
      }

      if (filters.importance !== "all" && note.importance !== filters.importance) {
        return false;
      }

      if (filters.status !== "all" && note.status !== filters.status) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        note.title,
        note.subcategory,
        note.summary,
        note.key_idea,
        note.content,
        note.example,
        note.source,
        note.category,
        ...note.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    }),
    filters.sort,
  );
}

export function buildDashboardData(notes: KnowledgeNote[]): DashboardData {
  const orderedNotes = sortNotes(notes, "recent");
  const reviewNotes = orderedNotes.filter((note) => getReviewBucket(note) === "today");
  const importantNotes = orderedNotes.filter((note) => note.importance === "eleve");
  const categoryCounts = buildCategoryCounts(notes).slice(0, 5);

  return {
    metrics: [
      {
        label: "Fiches totales",
        value: String(notes.length),
        detail: "Toutes vos notes accessibles depuis mobile et desktop.",
      },
      {
        label: "A revoir",
        value: String(reviewNotes.length),
        detail: "Fiches qui meritent une revision aujourd'hui.",
      },
      {
        label: "Importantes",
        value: String(importantNotes.length),
        detail: "Notes a fort impact ou a memoriser en priorite.",
      },
    ],
    recentNotes: orderedNotes.slice(0, 4),
    importantNotes: importantNotes.slice(0, 4),
    reviewNotes: reviewNotes.slice(0, 4),
    categoryCounts,
  };
}

export function buildCategoryCounts(notes: KnowledgeNote[]): CategoryCount[] {
  const counts = notes.reduce<Record<string, number>>((accumulator, note) => {
    accumulator[note.category] = (accumulator[note.category] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([category, count]) => ({
      category: category as CategoryCount["category"],
      count,
    }))
    .sort((leftItem, rightItem) => rightItem.count - leftItem.count || collator.compare(leftItem.category, rightItem.category));
}

export function getReviewBucket(note: KnowledgeNote, currentDate = new Date()): ReviewBucket {
  const dayDifference = getDayDifference(note.updated_at, currentDate);

  if (note.status === "a_apprendre" || (note.importance === "eleve" && dayDifference >= 3) || dayDifference >= 14) {
    return "today";
  }

  if (note.status === "en_cours" || dayDifference >= 7) {
    return "soon";
  }

  return "later";
}

export function buildReviewGroups(notes: KnowledgeNote[]): ReviewGroup[] {
  const orderedNotes = sortNotes(notes, "recent");

  return [
    {
      key: "today",
      label: "Aujourd'hui",
      description: "Les fiches a revoir maintenant pour garder la matiere fraiche.",
      notes: orderedNotes.filter((note) => getReviewBucket(note) === "today"),
    },
    {
      key: "soon",
      label: "Bientot",
      description: "Les fiches deja entamees mais qui meritent une nouvelle passe.",
      notes: orderedNotes.filter((note) => getReviewBucket(note) === "soon"),
    },
    {
      key: "later",
      label: "Plus tard",
      description: "Les fiches plus stables ou deja bien ancrees.",
      notes: orderedNotes.filter((note) => getReviewBucket(note) === "later"),
    },
  ];
}

export function getImportanceLabel(importance: NoteImportance): string {
  if (importance === "eleve") {
    return "Eleve";
  }

  if (importance === "moyen") {
    return "Moyen";
  }

  return "Faible";
}

export function getStatusLabel(status: NoteStatus): string {
  if (status === "a_apprendre") {
    return "A apprendre";
  }

  if (status === "en_cours") {
    return "En cours";
  }

  return "Maitrise";
}

export function getBucketLabel(bucket: ReviewBucket): string {
  if (bucket === "today") {
    return "Aujourd'hui";
  }

  if (bucket === "soon") {
    return "Bientot";
  }

  return "Plus tard";
}

export function getBucketHint(note: KnowledgeNote): string {
  const bucket = getReviewBucket(note);

  if (bucket === "today") {
    return "A relire maintenant";
  }

  if (bucket === "soon") {
    return "A planifier bientot";
  }

  return "Pas urgent";
}

export function formatNoteDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatRelativeDate(value: string, currentDate = new Date()): string {
  const dayDifference = getDayDifference(value, currentDate);

  if (dayDifference === 0) {
    return "Aujourd'hui";
  }

  if (dayDifference === 1) {
    return "Hier";
  }

  if (dayDifference < 7) {
    return `Il y a ${dayDifference} jours`;
  }

  return formatNoteDate(value);
}

export function parseTagsInput(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringifyTags(tags: string[]): string {
  return tags.join(", ");
}

export function buildSummarySuggestion(draft: Pick<KnowledgeNoteDraft, "title" | "content" | "key_idea" | "source">): string {
  if (draft.key_idea.trim()) {
    return `${draft.key_idea.trim()}${draft.source.trim() ? ` Source: ${draft.source.trim()}.` : ""}`;
  }

  if (draft.content.trim()) {
    const firstSentence = draft.content.trim().split(/[.!?]/)[0]?.trim() ?? "";

    if (firstSentence) {
      return firstSentence;
    }
  }

  if (draft.title.trim()) {
    return `Fiche de synthese sur ${draft.title.trim().toLowerCase()}.`;
  }

  return "";
}

export function buildTagSuggestions(draft: Pick<KnowledgeNoteDraft, "category" | "title" | "summary" | "key_idea" | "content">): string[] {
  const text = [draft.category, draft.title, draft.summary, draft.key_idea, draft.content]
    .join(" ")
    .toLowerCase();

  const candidates = text
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4);

  const sortedCandidates = candidates
    .filter((word, index) => candidates.indexOf(word) === index)
    .sort((leftWord, rightWord) => {
      const rightCount = candidates.filter((word) => word === rightWord).length;
      const leftCount = candidates.filter((word) => word === leftWord).length;
      return rightCount - leftCount;
    });

  return sortedCandidates.slice(0, 6);
}

export function buildQuizItems(note: KnowledgeNote): QuizItem[] {
  const items: QuizItem[] = [];

  if (note.key_idea.trim()) {
    items.push({
      question: `Quelle est l'idee cle de "${note.title}" ?`,
      answer: note.key_idea,
    });
  }

  if (note.summary.trim()) {
    items.push({
      question: "Quel resume en une phrase faut-il retenir ?",
      answer: note.summary,
    });
  }

  if (note.example.trim()) {
    items.push({
      question: "Quel exemple concret aide a ancrer cette fiche ?",
      answer: note.example,
    });
  }

  return items;
}

export function buildRelatedNotes(note: KnowledgeNote, notes: KnowledgeNote[]): KnowledgeNote[] {
  const noteTags = new Set(note.tags.map((tag) => tag.toLowerCase()));

  return sortNotes(
    notes.filter((candidate) => {
      if (candidate.id === note.id) {
        return false;
      }

      if (candidate.category === note.category) {
        return true;
      }

      return candidate.tags.some((tag) => noteTags.has(tag.toLowerCase()));
    }),
    "recent",
  ).slice(0, 3);
}

export function advanceNoteStatus(status: NoteStatus): NoteStatus {
  if (status === "a_apprendre") {
    return "en_cours";
  }

  if (status === "en_cours") {
    return "maitrise";
  }

  return "maitrise";
}

export function buildUpsertedNotes(notes: KnowledgeNote[], note: KnowledgeNote): KnowledgeNote[] {
  const withoutCurrentNote = notes.filter((currentNote) => currentNote.id !== note.id);
  return sortNotes([note, ...withoutCurrentNote], "recent");
}

export function buildDeletedNotes(notes: KnowledgeNote[], noteId: string): KnowledgeNote[] {
  return sortNotes(notes.filter((note) => note.id !== noteId), "recent");
}

function getDayDifference(value: string, currentDate: Date): number {
  const updatedAt = new Date(value).getTime();
  const now = currentDate.getTime();
  return Math.max(0, Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24)));
}
