"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReviewCalendarMonth } from "@/types";

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface ReviewCalendarProps {
  calendar: ReviewCalendarMonth;
  selectedDateKey: string;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

const intensityClasses = {
  none: "border-[var(--border)] bg-[var(--card)]",
  light: "border-[rgba(12,74,110,0.18)] bg-[rgba(12,74,110,0.06)]",
  medium: "border-[rgba(12,74,110,0.28)] bg-[rgba(12,74,110,0.10)]",
  strong: "border-[rgba(12,74,110,0.4)] bg-[rgba(12,74,110,0.14)]",
};

export function ReviewCalendar({
  calendar,
  selectedDateKey,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
}: ReviewCalendarProps) {
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Calendrier</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{calendar.monthLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onPreviousMonth} size="sm" variant="secondary">
            Prec.
          </Button>
          <Button onClick={onNextMonth} size="sm" variant="secondary">
            Suiv.
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendar.days.map((day) => {
          const isSelected = day.key === selectedDateKey;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDate(day.key)}
              className={cn(
                "min-h-16 rounded-[1rem] border p-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                intensityClasses[day.intensity],
                day.isCurrentMonth ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] opacity-65",
                isSelected
                  ? "border-[var(--accent)] bg-[rgba(12,74,110,0.16)] shadow-[0_12px_30px_rgba(12,74,110,0.12)]"
                  : "hover:border-[var(--border-strong)]",
              )}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("text-sm font-semibold", day.isToday ? "text-[var(--accent)]" : undefined)}>
                  {day.dayNumber}
                </span>
                {day.notes.length > 0 ? (
                  <span className="rounded-full bg-[var(--card-strong)] px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground)]">
                    {day.notes.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center gap-1">
                {day.notes.slice(0, 3).map((note) => (
                  <span
                    key={note.id}
                    className="h-2 w-2 rounded-full bg-[var(--accent)]"
                    title={note.title}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-sm leading-6 text-[var(--muted-foreground)]">
        Touchez un jour pour voir les fiches prevues. Les jours colores regroupent les revisions du flux actuel.
      </p>
    </Card>
  );
}
