"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlannerCalendarMonth } from "@/types";

const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface PlannerCalendarProps {
  calendar: PlannerCalendarMonth;
  selectedDateKey: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

export function PlannerCalendar({
  calendar,
  selectedDateKey,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: PlannerCalendarProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Vue mois</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{calendar.monthLabel}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onPreviousMonth}>
            Prec.
          </Button>
          <Button size="sm" variant="secondary" onClick={onNextMonth}>
            Suiv.
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 px-4 pb-4 pt-4 sm:px-6">
        {weekdayLabels.map((label) => (
          <div key={label} className="px-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {label}
          </div>
        ))}

        {calendar.days.map((day) => {
          const isSelected = day.key === selectedDateKey;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDate(day.key)}
              className={cn(
                "flex min-h-20 flex-col rounded-[1.1rem] border px-2 py-2 text-left transition sm:min-h-24 sm:px-3",
                day.isCurrentMonth
                  ? "border-[var(--border)] bg-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]",
                day.isToday && "border-[var(--accent)]",
                isSelected && "bg-[rgba(12,74,110,0.10)] ring-2 ring-[rgba(12,74,110,0.16)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-sm font-semibold", isSelected && "text-[var(--accent)]")}>
                  {day.dayNumber}
                </span>
                {day.items.length > 0 ? (
                  <span className="rounded-full bg-[var(--card-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted-foreground)]">
                    {day.items.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-auto flex flex-wrap gap-1 pt-3">
                {day.items.slice(0, 3).map((item) => (
                  <span
                    key={item.id}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.status === "termine" ? "bg-[#166534]" : "bg-[var(--accent)]",
                    )}
                  />
                ))}
                {day.items.length > 3 ? (
                  <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">+{day.items.length - 3}</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
