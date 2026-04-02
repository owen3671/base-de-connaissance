import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "@/components/ui/icons";
import {
  formatRelativeDate,
  getBucketHint,
  getImportanceLabel,
  getStatusLabel,
} from "@/lib/note-utils";
import type { KnowledgeNote } from "@/types";

interface NoteCardProps {
  note: KnowledgeNote;
  action?: ReactNode;
}

function getImportanceTone(importance: KnowledgeNote["importance"]) {
  if (importance === "eleve") {
    return "warning";
  }

  if (importance === "moyen") {
    return "accent";
  }

  return "neutral";
}

function getStatusTone(status: KnowledgeNote["status"]) {
  if (status === "maitrise") {
    return "success";
  }

  if (status === "en_cours") {
    return "accent";
  }

  return "warning";
}

export function NoteCard({ action, note }: NoteCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{note.category}</Badge>
            <Badge tone={getImportanceTone(note.importance)}>{getImportanceLabel(note.importance)}</Badge>
            <Badge tone={getStatusTone(note.status)}>{getStatusLabel(note.status)}</Badge>
          </div>
          <Link href={`/notes/${note.id}`} className="mt-3 block">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{note.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {note.summary || note.key_idea || note.content.slice(0, 180)}
            </p>
          </Link>
        </div>
        <Link
          aria-label={`Ouvrir la fiche ${note.title}`}
          className="hidden rounded-full border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex"
          href={`/notes/${note.id}`}
        >
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {note.tags.slice(0, 4).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>{note.source || "Source a preciser"}</p>
          <p>
            Mis a jour {formatRelativeDate(note.updated_at)} · {getBucketHint(note)}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </Card>
  );
}
