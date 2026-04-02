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
import { readLocalNotes, writeLocalNotes } from "@/lib/local-storage";
import {
  advanceNoteStatus,
  buildDeletedNotes,
  buildUpsertedNotes,
  createEmptyNoteDraft,
  sortNotes,
} from "@/lib/note-utils";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import type {
  AuthResult,
  DataMode,
  Database,
  KnowledgeNote,
  SaveNotePayload,
  SaveNoteResult,
} from "@/types";

interface AppContextValue {
  notes: KnowledgeNote[];
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

function buildNoteRecord(payload: SaveNotePayload, currentNote?: KnowledgeNote, userId?: string | null): KnowledgeNote {
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<KnowledgeNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sourceMode, setSourceMode] = useState<DataMode>("local");
  const [supabase] = useState(() =>
    isSupabaseConfigured ? createBrowserClient<Database, "public">(supabaseUrl, supabaseAnonKey) : null,
  );

  useEffect(() => {
    const localNotes = sortNotes(readLocalNotes(), "recent");
    setNotes(localNotes);

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
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const remoteNotes = await fetchSupabaseNotes(supabase, nextSession.user.id);
        setSourceMode("supabase");
        setNotes(remoteNotes);
      } catch {
        setSourceMode("local");
        setNotes(sortNotes(readLocalNotes(), "recent"));
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
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const remoteNotes = await fetchSupabaseNotes(supabase, user.id);
      setSourceMode("supabase");
      setNotes(remoteNotes);
    } catch {
      setSourceMode("local");
      setNotes(sortNotes(readLocalNotes(), "recent"));
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
