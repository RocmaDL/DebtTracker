"use client";

import { ChevronRight } from "lucide-react";
import { ACTIVITIES, CATEGORIES } from "@/lib/catalog";
import { expenseMinutes, sessionRepayment } from "@/lib/engine";
import type { Entry } from "@/lib/types";
import { cn, formatDuration, formatEuro } from "@/lib/utils";

export function EntryRow({ entry, rate, onClick, meta }: { entry: Entry; rate: number; onClick?: () => void; meta?: string }) {
  const isExpense = entry.kind === "expense";
  const icon = isExpense ? CATEGORIES[entry.category].emoji : ACTIVITIES[entry.activity].emoji;
  const title = isExpense ? CATEGORIES[entry.category].label : ACTIVITIES[entry.activity].label;
  const impact = isExpense ? expenseMinutes(entry, rate) : sessionRepayment(entry);
  const sub = isExpense ? formatEuro(entry.amount) : formatDuration(entry.duration);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.035] focus-visible:bg-white/[0.035]"
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl text-xl",
          isExpense ? "bg-ember/10 ring-1 ring-ember/20" : "bg-volt/10 ring-1 ring-volt/20",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        <span className="block truncate text-xs text-fg-subtle">
          {[meta, entry.note, sub].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="text-right">
        <span className={cn("block font-mono text-sm font-semibold tabular-nums", isExpense ? "text-ember-soft" : impact > 0 ? "text-volt" : "text-fg-muted")}>
          {isExpense ? `+${impact}` : impact > 0 ? `−${impact}` : "±0"} <span className="text-[10px] font-normal opacity-70">min</span>
        </span>
        {!isExpense && <span className="block text-[10px] text-fg-subtle">+{entry.duration + impact} XP</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-fg-subtle opacity-0 transition group-hover:opacity-100" aria-hidden />
    </button>
  );
}
