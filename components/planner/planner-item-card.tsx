"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatPlannerTimeRange,
  getPlannerStatusLabel,
  getPlannerTypeLabel,
} from "@/lib/planner-utils";
import { cn } from "@/lib/utils";
import type { PlannerItem } from "@/types";

interface PlannerItemCardProps {
  item: PlannerItem;
  isBusy?: boolean;
  onEdit: (item: PlannerItem) => void;
  onDelete: (item: PlannerItem) => void;
  onToggleStatus: (item: PlannerItem) => void;
}

function getTypeTone(itemType: PlannerItem["item_type"]): "neutral" | "accent" | "success" | "warning" {
  if (itemType === "revision") {
    return "accent";
  }

  if (itemType === "rendez_vous") {
    return "warning";
  }

  if (itemType === "objectif") {
    return "success";
  }

  return "neutral";
}

export function PlannerItemCard({
  item,
  isBusy,
  onDelete,
  onEdit,
  onToggleStatus,
}: PlannerItemCardProps) {
  return (
    <Card className={cn("space-y-4", item.status === "termine" && "bg-[rgba(22,101,52,0.05)]")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getTypeTone(item.item_type)}>{getPlannerTypeLabel(item.item_type)}</Badge>
            <Badge tone={item.status === "termine" ? "success" : "neutral"}>
              {getPlannerStatusLabel(item.status)}
            </Badge>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
          <p className="mt-2 text-sm font-medium text-[var(--accent)]">{formatPlannerTimeRange(item)}</p>
        </div>
      </div>

      {item.details ? (
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{item.details}</p>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">Aucun detail ajoute pour ce creneau.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={item.status === "termine" ? "secondary" : "primary"}
          disabled={isBusy}
          onClick={() => onToggleStatus(item)}
        >
          {item.status === "termine" ? "Remettre en cours" : "Marquer termine"}
        </Button>
        <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => onEdit(item)}>
          Modifier
        </Button>
        <Button size="sm" variant="danger" disabled={isBusy} onClick={() => onDelete(item)}>
          Supprimer
        </Button>
      </div>
    </Card>
  );
}
