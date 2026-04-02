import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
}

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-4 border-dashed">
      {icon ? <div className="rounded-2xl bg-[var(--card-strong)] p-3 text-[var(--accent)]">{icon}</div> : null}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </Card>
  );
}
