export type NoteCategory =
  | "Podcasts"
  | "Culture G"
  | "Geopolitique"
  | "Economie"
  | "Histoire"
  | "Concepts"
  | "Citations"
  | "Revisions";

export type NoteImportance = "faible" | "moyen" | "eleve";
export type NoteStatus = "a_apprendre" | "en_cours" | "maitrise";
export type ReviewBucket = "today" | "soon" | "later";
export type NotesSort = "recent" | "oldest" | "importance";
export type DataMode = "local" | "supabase";

export interface KnowledgeNoteDraft {
  title: string;
  category: NoteCategory;
  subcategory: string;
  summary: string;
  key_idea: string;
  content: string;
  example: string;
  source: string;
  tags: string[];
  importance: NoteImportance;
  status: NoteStatus;
}

export interface KnowledgeNote extends KnowledgeNoteDraft {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteFilters {
  query: string;
  category: NoteCategory | "all";
  importance: NoteImportance | "all";
  status: NoteStatus | "all";
  sort: NotesSort;
}

export interface NavigationItem {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
}

export interface CategoryCount {
  category: NoteCategory;
  count: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  recentNotes: KnowledgeNote[];
  importantNotes: KnowledgeNote[];
  reviewNotes: KnowledgeNote[];
  categoryCounts: CategoryCount[];
}

export interface ReviewGroup {
  key: ReviewBucket;
  label: string;
  description: string;
  notes: KnowledgeNote[];
}

export interface QuizItem {
  question: string;
  answer: string;
}

export interface SaveNotePayload extends KnowledgeNoteDraft {
  id?: string;
}

export interface SaveNoteResult {
  success: boolean;
  note?: KnowledgeNote;
  error?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: KnowledgeNote;
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          category: NoteCategory;
          subcategory?: string | null;
          summary?: string | null;
          key_idea?: string | null;
          content?: string | null;
          example?: string | null;
          source?: string | null;
          tags?: string[] | null;
          importance: NoteImportance;
          status: NoteStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          category?: NoteCategory;
          subcategory?: string | null;
          summary?: string | null;
          key_idea?: string | null;
          content?: string | null;
          example?: string | null;
          source?: string | null;
          tags?: string[] | null;
          importance?: NoteImportance;
          status?: NoteStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
