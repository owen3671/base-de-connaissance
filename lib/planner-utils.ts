import type {
  PlannerCalendarDay,
  PlannerCalendarMonth,
  PlannerItem,
  PlannerItemDraft,
  PlannerItemStatus,
  PlannerItemType,
  PlannerTimelineDay,
  PlannerView,
  SavePlannerItemPayload,
} from "@/types";

const collator = new Intl.Collator("fr-FR");

export function createEmptyPlannerItemDraft(selectedDate = getPlannerDateValue(new Date())): PlannerItemDraft {
  return {
    title: "",
    details: "",
    date: selectedDate,
    start_time: "09:00",
    end_time: "10:00",
    all_day: false,
    item_type: "tache",
    status: "planifie",
  };
}

export function buildPlannerDraftFromItem(item: PlannerItem): SavePlannerItemPayload {
  const startsAt = new Date(item.starts_at);
  const endsAt = item.ends_at ? new Date(item.ends_at) : null;

  return {
    id: item.id,
    title: item.title,
    details: item.details,
    date: getPlannerDateValue(startsAt),
    start_time: item.all_day ? "" : formatPlannerInputTime(startsAt),
    end_time: item.all_day || !endsAt ? "" : formatPlannerInputTime(endsAt),
    all_day: item.all_day,
    item_type: item.item_type,
    status: item.status,
  };
}

export function buildPlannerItemRecord(
  payload: SavePlannerItemPayload,
  currentItem?: PlannerItem,
  userId?: string | null,
): PlannerItem {
  const now = new Date().toISOString();
  const startsAt = buildPlannerDateTime(payload.date, payload.all_day ? "00:00" : payload.start_time);
  const endsAt = payload.all_day
    ? buildPlannerDateTime(payload.date, "23:59")
    : payload.end_time
      ? buildPlannerDateTime(payload.date, payload.end_time)
      : null;

  return {
    id: currentItem?.id ?? payload.id ?? crypto.randomUUID(),
    user_id: currentItem?.user_id ?? userId ?? null,
    title: payload.title.trim(),
    details: payload.details.trim(),
    starts_at: startsAt,
    ends_at: endsAt,
    all_day: payload.all_day,
    item_type: payload.item_type,
    status: payload.status,
    created_at: currentItem?.created_at ?? now,
    updated_at: now,
  };
}

export function sortPlannerItems(items: PlannerItem[]): PlannerItem[] {
  return [...items].sort((leftItem, rightItem) => {
    const byStartDate = Date.parse(leftItem.starts_at) - Date.parse(rightItem.starts_at);

    if (byStartDate !== 0) {
      return byStartDate;
    }

    const byStatus = Number(leftItem.status === "termine") - Number(rightItem.status === "termine");

    if (byStatus !== 0) {
      return byStatus;
    }

    return collator.compare(leftItem.title, rightItem.title);
  });
}

export function buildUpsertedPlannerItems(items: PlannerItem[], plannerItem: PlannerItem): PlannerItem[] {
  const remainingItems = items.filter((currentItem) => currentItem.id !== plannerItem.id);
  return sortPlannerItems([...remainingItems, plannerItem]);
}

export function buildDeletedPlannerItems(items: PlannerItem[], plannerItemId: string): PlannerItem[] {
  return sortPlannerItems(items.filter((item) => item.id !== plannerItemId));
}

export function advancePlannerItemStatus(status: PlannerItemStatus): PlannerItemStatus {
  return status === "termine" ? "planifie" : "termine";
}

export function buildPlannerMonth(items: PlannerItem[], focusedDate: Date, currentDate = new Date()): PlannerCalendarMonth {
  const monthStart = startOfDay(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));
  const monthEnd = startOfDay(new Date(focusedDate.getFullYear(), focusedDate.getMonth() + 1, 0));
  const gridStart = addDays(monthStart, -getWeekdayIndex(monthStart));
  const gridEnd = addDays(monthEnd, 6 - getWeekdayIndex(monthEnd));
  const itemMap = groupPlannerItemsByDay(items);
  const days: PlannerCalendarDay[] = [];

  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    const key = getPlannerDateValue(cursor);
    days.push({
      key,
      dayNumber: cursor.getDate(),
      isCurrentMonth: cursor.getMonth() === focusedDate.getMonth(),
      isToday: key === getPlannerDateValue(currentDate),
      items: itemMap[key] ?? [],
    });
  }

  return {
    monthLabel: capitalize(
      new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      }).format(monthStart),
    ),
    days,
  };
}

export function buildPlannerTimeline(items: PlannerItem[], selectedDate: Date, view: PlannerView): PlannerTimelineDay[] {
  if (view === "day") {
    const key = getPlannerDateValue(selectedDate);
    return [
      {
        key,
        label: formatPlannerLongDate(selectedDate),
        isToday: key === getPlannerDateValue(new Date()),
        items: filterPlannerItemsForDate(items, selectedDate),
      },
    ];
  }

  const weekStart = startOfWeek(selectedDate);
  const days: PlannerTimelineDay[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const day = addDays(weekStart, offset);
    const key = getPlannerDateValue(day);

    days.push({
      key,
      label: new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
      }).format(day),
      isToday: key === getPlannerDateValue(new Date()),
      items: filterPlannerItemsForDate(items, day),
    });
  }

  return days;
}

export function getPlannerViewLabel(view: PlannerView): string {
  if (view === "day") {
    return "Jour";
  }

  if (view === "week") {
    return "Semaine";
  }

  return "Mois";
}

export function getPlannerTypeLabel(type: PlannerItemType): string {
  if (type === "rendez_vous") {
    return "Rendez-vous";
  }

  if (type === "revision") {
    return "Revision";
  }

  if (type === "objectif") {
    return "Objectif";
  }

  return "Tache";
}

export function getPlannerStatusLabel(status: PlannerItemStatus): string {
  return status === "termine" ? "Termine" : "Planifie";
}

export function getPlannerDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parsePlannerDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

export function shiftPlannerViewDate(date: Date, view: PlannerView, amount: number): Date {
  if (view === "day") {
    return addDays(date, amount);
  }

  if (view === "week") {
    return addDays(date, amount * 7);
  }

  return startOfDay(new Date(date.getFullYear(), date.getMonth() + amount, 1));
}

export function formatPlannerToolbarLabel(selectedDate: Date, view: PlannerView): string {
  if (view === "day") {
    return formatPlannerLongDate(selectedDate);
  }

  if (view === "week") {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = addDays(weekStart, 6);

    return `${formatPlannerShortDate(weekStart)} - ${formatPlannerShortDate(weekEnd)}`;
  }

  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(selectedDate),
  );
}

export function formatPlannerTimeRange(item: PlannerItem): string {
  if (item.all_day) {
    return "Toute la journee";
  }

  const start = formatPlannerTime(item.starts_at);

  if (!item.ends_at) {
    return start;
  }

  return `${start} - ${formatPlannerTime(item.ends_at)}`;
}

export function formatPlannerLongDate(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date),
  );
}

function formatPlannerShortDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function buildPlannerDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function formatPlannerTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPlannerInputTime(date: Date): string {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function filterPlannerItemsForDate(items: PlannerItem[], date: Date): PlannerItem[] {
  const key = getPlannerDateValue(date);
  return sortPlannerItems(
    items.filter((item) => getPlannerDateValue(new Date(item.starts_at)) === key),
  );
}

function groupPlannerItemsByDay(items: PlannerItem[]): Record<string, PlannerItem[]> {
  return sortPlannerItems(items).reduce<Record<string, PlannerItem[]>>((accumulator, item) => {
    const key = getPlannerDateValue(new Date(item.starts_at));
    accumulator[key] = [...(accumulator[key] ?? []), item];
    return accumulator;
  }, {});
}

function startOfWeek(date: Date): Date {
  return addDays(startOfDay(date), -getWeekdayIndex(date));
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
