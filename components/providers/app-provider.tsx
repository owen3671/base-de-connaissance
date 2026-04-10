"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  readLocalNotes,
  readLocalPlannerItems,
  writeLocalNotes,
  writeLocalPlannerItems,
} from "@/lib/local-storage";
import {
  advanceNoteStatus,
  buildDeletedNotes,
  buildUpsertedNotes,
  createEmptyNoteDraft,
  sortNotes,
} from "@/lib/note-utils";
import {
  advancePlannerItemStatus,
  buildPlannerDraftFromItem,
  buildDeletedPlannerItems,
  buildPlannerItemRecord,
  buildUpsertedPlannerItems,
  sortPlannerItems,
} from "@/lib/planner-utils";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import type {
  AuthResult,
  DataMode,
  Database,
  KnowledgeNote,
  PlannerItem,
  SaveNotePayload,
  SaveNoteResult,
  SavePlannerItemPayload,
  SavePlannerItemResult,
} from "@/types";

interface AppContextValue {
  notes: KnowledgeNote[];
  plannerItems: PlannerItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseConfigured: boolean;
  sourceMode: DataMode;
  session: Session | null;
  user: User | null;
  userEmail: string | null;
  refreshNotes: () => Promise<void>;
  saveNote: (payload: SaveNotePayload) => Promise<SaveNoteResult>;
  deleteNote: (noteId: string) => Promise<AuthResult>;
  markNoteReviewed: (noteId: string) => Promise<SaveNoteResult>;
  savePlannerItem: (payload: SavePlannerItemPayload) => Promise<SavePlannerItemResult>;
  deletePlannerItem: (plannerItemId: string) => Promise<AuthResult>;
  togglePlannerItemStatus: (plannerItemId: string) => Promise<SavePlannerItemResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

const AppContext = createContext<AppContextValue | null>(null);

function normalizeNote(note: Database["public"]["Tables"]["notes"]["Row"]): KnowledgeNote {
  return {
    ...note,
    subcategory: note.subcategory ?? "",
    summary: note.summary ?? "",
    key_idea: note.key_idea ?? "",
    content: note.content ?? "",
    example: note.example ?? "",
    source: note.source ?? "",
    tags: note.tags ?? [],
  };
}

function normalizePlannerItem(
  plannerItem: Database["public"]["Tables"]["planner_items"]["Row"],
): PlannerItem {
  return {
    ...plannerItem,
    details: plannerItem.details ?? "",
    ends_at: plannerItem.ends_at ?? null,
  };
}

function buildNoteRecord(
  payload: SaveNotePayload,
  currentNote?: KnowledgeNote,
  userId?: string | null,
): KnowledgeNote {
  const now = new Date().toISOString();

  return {
    id: currentNote?.id ?? payload.id ?? crypto.randomUUID(),
    user_id: currentNote?.user_id ?? userId ?? null,
    title: payload.title.trim(),
    category: payload.category,
    subcategory: payload.subcategory.trim(),
    summary: payload.summary.trim(),
    key_idea: payload.key_idea.trim(),
    content: payload.content.trim(),
    example: payload.example.trim(),
    source: payload.source.trim(),
    tags: payload.tags,
    importance: payload.importance,
    status: payload.status,
    created_at: currentNote?.created_at ?? now,
    updated_at: now,
  };
}

async function fetchSupabaseNotes(
  client: SupabaseClient<Database, "public">,
  userId: string,
): Promise<KnowledgeNote[]> {
  const { data, error } = await client
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeNote);
}

async function fetchSupabasePlannerItems(
  client: SupabaseClient<Database, "public">,
  userId: string,
): Promise<PlannerItem[]> {
  const { data, error } = await client
    .from("planner_items")
    .select("*")
    .eq("user_id", userId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortPlannerItems((data ?? []).map(normalizePlannerItem));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<KnowledgeNote[]>([]);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sourceMode, setSourceMode] = useState<DataMode>("local");
  const [supabase] = useState(() =>
    isSupabaseConfigured ? createBrowserClient<Database, "public">(supabaseUrl, supabaseAnonKey) : null,
  );

  useEffect(() => {
    setNotes(sortNotes(readLocalNotes(), "recent"));
    setPlannerItems(sortPlannerItems(readLocalPlannerItems()));

    if (!supabase) {
      setSourceMode("local");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function syncFromSession(nextSession: Session | null): Promise<void> {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!supabase || !nextSession?.user) {
        setSourceMode("local");
        setNotes(sortNotes(readLocalNotes(), "recent"));
        setPlannerItems(sortPlannerItems(readLocalPlannerItems()));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const [remoteNotes, remotePlannerItems] = await Promise.all([
          fetchSupabaseNotes(supabase, nextSession.user.id),
          fetchSupabasePlannerItems(supabase, nextSession.user.id),
        ]);
        setSourceMode("supabase");
        setNotes(remoteNotes);
        setPlannerItems(remotePlannerItems);
      } catch {
        setSourceMode("local");
        setNotes(sortNotes(readLocalNotes(), "recent"));
        setPlannerItems(sortPlannerItems(readLocalPlannerItems()));
      } finally {
        setIsLoading(false);
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        void syncFromSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        void syncFromSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function refreshNotes(): Promise<void> {
    if (!supabase || !user) {
      setSourceMode("local");
      setNotes(sortNotes(readLocalNotes(), "recent"));
      setPlannerItems(sortPlannerItems(readLocalPlannerItems()));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [remoteNotes, remotePlannerItems] = await Promise.all([
        fetchSupabaseNotes(supabase, user.id),
        fetchSupabasePlannerItems(supabase, user.id),
      ]);
      setSourceMode("supabase");
      setNotes(remoteNotes);
      setPlannerItems(remotePlannerItems);
    } catch {
      setSourceMode("local");
      setNotes(sortNotes(readLocalNotes(), "recent"));
      setPlannerItems(sortPlannerItems(readLocalPlannerItems()));
    } finally {
      setIsLoading(false);
    }
  }

  async function saveNote(payload: SaveNotePayload): Promise<SaveNoteResult> {
    if (!payload.title.trim()) {
      return {
        success: false,
        error: "Le titre est obligatoire.",
      };
    }

    const currentNote = notes.find((note) => note.id === payload.id);
    const nextNote = buildNoteRecord(payload, currentNote, user?.id ?? null);

    if (!supabase || !user) {
      const nextNotes = buildUpsertedNotes(notes, nextNote);
      setSourceMode("local");
      setNotes(nextNotes);
      writeLocalNotes(nextNotes);
      return {
        success: true,
        note: nextNote,
      };
    }

    const notePayload: Database["public"]["Tables"]["notes"]["Insert"] = {
      ...nextNote,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("notes")
      .upsert(notePayload as never)
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const normalizedNote = normalizeNote(data);
    setSourceMode("supabase");
    setNotes(buildUpsertedNotes(notes, normalizedNote));

    return {
      success: true,
      note: normalizedNote,
    };
  }

  async function savePlannerItem(payload: SavePlannerItemPayload): Promise<SavePlannerItemResult> {
    if (!payload.title.trim()) {
      return {
        success: false,
        error: "Le titre est obligatoire.",
      };
    }

    const currentPlannerItem = plannerItems.find((item) => item.id === payload.id);
    const nextPlannerItem = buildPlannerItemRecord(payload, currentPlannerItem, user?.id ?? null);

    if (!supabase || !user) {
      const nextPlannerItems = buildUpsertedPlannerItems(plannerItems, nextPlannerItem);
      setSourceMode("local");
      setPlannerItems(nextPlannerItems);
      writeLocalPlannerItems(nextPlannerItems);
      return {
        success: true,
        plannerItem: nextPlannerItem,
      };
    }

    const plannerItemPayload: Database["public"]["Tables"]["planner_items"]["Insert"] = {
      ...nextPlannerItem,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("planner_items")
      .upsert(plannerItemPayload as never)
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const normalizedPlannerItem = normalizePlannerItem(data);
    setSourceMode("supabase");
    setPlannerItems(buildUpsertedPlannerItems(plannerItems, normalizedPlannerItem));

    return {
      success: true,
      plannerItem: normalizedPlannerItem,
    };
  }

  async function deleteNote(noteId: string): Promise<AuthResult> {
    if (!supabase || !user) {
      const nextNotes = buildDeletedNotes(notes, noteId);
      setSourceMode("local");
      setNotes(nextNotes);
      writeLocalNotes(nextNotes);
      return {
        success: true,
      };
    }

    const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    setSourceMode("supabase");
    setNotes(buildDeletedNotes(notes, noteId));
    return {
      success: true,
    };
  }

  async function deletePlannerItem(plannerItemId: string): Promise<AuthResult> {
    if (!supabase || !user) {
      const nextPlannerItems = buildDeletedPlannerItems(plannerItems, plannerItemId);
      setSourceMode("local");
      setPlannerItems(nextPlannerItems);
      writeLocalPlannerItems(nextPlannerItems);
      return {
        success: true,
      };
    }

    const { error } = await supabase
      .from("planner_items")
      .delete()
      .eq("id", plannerItemId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    setSourceMode("supabase");
    setPlannerItems(buildDeletedPlannerItems(plannerItems, plannerItemId));
    return {
      success: true,
    };
  }

  async function markNoteReviewed(noteId: string): Promise<SaveNoteResult> {
    const currentNote = notes.find((note) => note.id === noteId);

    if (!currentNote) {
      return {
        success: false,
        error: "Fiche introuvable.",
      };
    }

    return saveNote({
      ...createEmptyNoteDraft(),
      ...currentNote,
      id: currentNote.id,
      status: advanceNoteStatus(currentNote.status),
      tags: currentNote.tags,
    });
  }

  async function togglePlannerItemStatus(plannerItemId: string): Promise<SavePlannerItemResult> {
    const currentPlannerItem = plannerItems.find((plannerItem) => plannerItem.id === plannerItemId);

    if (!currentPlannerItem) {
      return {
        success: false,
        error: "Element du calendrier introuvable.",
      };
    }

    return savePlannerItem({
      ...buildPlannerDraftFromItem(currentPlannerItem),
      status: advancePlannerItemStatus(currentPlannerItem.status),
    });
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      return {
        success: false,
        error: "Supabase n'est pas configure pour ce projet.",
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      return {
        success: false,
        error: "Supabase n'est pas configure pour ce projet.",
      };
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  }

  async function signOut(): Promise<AuthResult> {
    if (!supabase) {
      return {
        success: true,
      };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  }

  return (
    <AppContext.Provider
      value={{
        notes,
        plannerItems,
        isLoading,
        isAuthenticated: Boolean(user),
        isSupabaseConfigured,
        sourceMode,
        session,
        user,
        userEmail: user?.email ?? null,
        refreshNotes,
        saveNote,
        deleteNote,
        markNoteReviewed,
        savePlannerItem,
        deletePlannerItem,
        togglePlannerItemStatus,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider.");
  }

  return context;
}
