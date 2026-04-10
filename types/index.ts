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
export type ReviewCalendarIntensity = "none" | "light" | "medium" | "strong";
export type NotesSort = "recent" | "oldest" | "importance";
export type DataMode = "local" | "supabase";
export type PlannerItemType = "tache" | "rendez_vous" | "revision" | "objectif";
export type PlannerItemStatus = "planifie" | "termine";
export type PlannerView = "day" | "week" | "month";

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

export interface PlannerItemDraft {
  title: string;
  details: string;
  date: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  item_type: PlannerItemType;
  status: PlannerItemStatus;
}

export interface PlannerItem extends Omit<PlannerItemDraft, "date" | "start_time" | "end_time"> {
  id: string;
  user_id: string | null;
  starts_at: string;
  ends_at: string | null;
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

export interface ReviewCalendarDay {
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  notes: KnowledgeNote[];
  intensity: ReviewCalendarIntensity;
}

export interface ReviewCalendarMonth {
  monthLabel: string;
  days: ReviewCalendarDay[];
}

export interface PlannerCalendarDay {
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: PlannerItem[];
}

export interface PlannerCalendarMonth {
  monthLabel: string;
  days: PlannerCalendarDay[];
}

export interface PlannerTimelineDay {
  key: string;
  label: string;
  isToday: boolean;
  items: PlannerItem[];
}

export interface QuizItem {
  question: string;
  answer: string;
}

export interface SaveNotePayload extends KnowledgeNoteDraft {
  id?: string;
}

export interface SavePlannerItemPayload extends PlannerItemDraft {
  id?: string;
}

export interface SaveNoteResult {
  success: boolean;
  note?: KnowledgeNote;
  error?: string;
}

export interface SavePlannerItemResult {
  success: boolean;
  plannerItem?: PlannerItem;
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
      planner_items: {
        Row: PlannerItem;
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          details?: string | null;
          item_type: PlannerItemType;
          status: PlannerItemStatus;
          starts_at: string;
          ends_at?: string | null;
          all_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          details?: string | null;
          item_type?: PlannerItemType;
          status?: PlannerItemStatus;
          starts_at?: string;
          ends_at?: string | null;
          all_day?: boolean;
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
