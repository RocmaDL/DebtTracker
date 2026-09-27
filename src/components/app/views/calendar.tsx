"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { addMonths, formatDayMonth, formatMonth, formatWeekday, monthKey, WEEKDAYS_SHORT } from "@/lib/dates";
import { calendarMonth, monthRange, summarize, type CalendarDay } from "@/lib/engine";
import { useUI } from "@/lib/ui-store";
import { cn, formatDuration, formatEuro, plural } from "@/lib/utils";
import { useDerived } from "@/hooks/use-derived";
import { Button } from "../../ui/button";

export function CalendarView() {
  const d = useDerived();
  const open = useUI((s) => s.open);
  const [cursor, setCursor] = useState(d.today);
  const [dir, setDir] = useState(0);

  const days = useMemo(() => calendarMonth(d.entries, d.settings, cursor, d.today), [d.entries, d.settings, cursor, d.today]);
  const [from, to] = monthRange(cursor);
  const summary = useMemo(() => summarize(d.entries, d.settings, from, to, d.today), [d.entries, d.settings, from, to, d.today]);
  const isCurrent = monthKey(cursor) === monthKey(d.today);

  const shift = (n: number) => {
    setDir(n);
    setCursor(addMonths(cursor, n));
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Calendrier</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl" aria-live="polite">
            {formatMonth(cursor)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrent && (
            <Button variant="ghost" size="sm" onClick={() => { setDir(cursor < d.today ? 1 : -1); setCursor(d.today); }}>
              Aujourd&apos;hui
            </Button>
          )}
          <Button variant="secondary" size="icon" aria-label="Mois précédent" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Mois suivant" onClick={() => shift(1)} disabled={isCurrent}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
        <Summary label="Séances" value={`${summary.sessions}`} sub={`sur ${summary.scheduled} ${plural(summary.scheduled, "prévue")}`} />
        <Summary label="Remboursé" value={formatDuration(summary.repaid)} sub={`${formatDuration(summary.sportMinutes)} de sport`} tone="text-volt" />
        <Summary label="Dette ajoutée" value={formatDuration(summary.debtAdded)} sub={`${summary.expenses} ${plural(summary.expenses, "écart")}`} tone="text-ember-soft" />
        <Summary label="Dépensé" value={formatEuro(summary.spent)} sub={summary.missed > 0 ? `${summary.missed} ${plural(summary.missed, "séance manquée", "séances manquées")}` : "Aucune séance manquée"} />
      </dl>

      <section className="card overflow-hidden p-3 sm:p-6" aria-label={`Calendrier de ${formatMonth(cursor)}`}>
        <div className="grid grid-cols-7 gap-1 pb-2 sm:gap-2" aria-hidden>
          {WEEKDAYS_SHORT.map((w) => (
            <div key={w} className="eyebrow text-center">
              {w}
            </div>
          ))}
        </div>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={monthKey(cursor)}
            custom={dir}
            initial={{ opacity: 0, x: dir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-7 gap-1 sm:gap-2"
            role="grid"
          >
            {days.map((day) => (
              <DayCell key={day.date} day={day} onClick={() => open({ type: "day", date: day.date })} />
            ))}
          </motion.div>
        </AnimatePresence>

        <ul className="hairline mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t px-1 pt-4 text-xs text-fg-muted" aria-label="Légende">
          <Legend swatch={<span className="size-3 rounded-full bg-volt" />} label="Séance honorée" />
          <Legend swatch={<span className="size-3 rounded-full border-2 border-volt" />} label="Séance bonus" />
          <Legend swatch={<span className="size-3 rounded-full border-2 border-ember" />} label="Séance manquée" />
          <Legend swatch={<span className="size-3 rounded-full border border-dashed border-fg-subtle" />} label="Planifiée" />
          <Legend swatch={<span className="h-1 w-3 rounded-full bg-ember" />} label="Écart fast-food" />
        </ul>
      </section>
    </div>
  );
}

function Summary({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <dt className="eyebrow">{label}</dt>
      <dd className={cn("mt-2 text-2xl font-semibold tracking-tight tabular-nums", tone)}>{value}</dd>
      <dd className="mt-1 text-xs text-fg-subtle">{sub}</dd>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="grid w-3 place-items-center" aria-hidden>
        {swatch}
      </span>
      {label}
    </li>
  );
}

const STATE_LABEL: Record<CalendarDay["state"], string> = {
  done: "séance honorée",
  extra: "séance bonus",
  missed: "séance manquée",
  planned: "séance planifiée",
  rest: "repos",
};

function DayCell({ day, onClick }: { day: CalendarDay; onClick: () => void }) {
  const spent = day.expenses.reduce((s, e) => s + e.amount, 0);
  const minutes = day.sessions.reduce((s, e) => s + e.duration, 0);
  const label = `${formatWeekday(day.date)} ${formatDayMonth(day.date)} : ${STATE_LABEL[day.state]}${minutes ? `, ${minutes} minutes` : ""}${spent ? `, ${formatEuro(spent)} de fast-food` : ""}`;

  return (
    <button
      type="button"
      role="gridcell"
      onClick={onClick}
      aria-label={label}
      aria-current={day.isToday ? "date" : undefined}
      className={cn(
        "group relative flex aspect-square min-h-12 flex-col rounded-xl border p-1.5 text-left transition sm:aspect-[1.15] sm:rounded-2xl sm:p-2.5",
        day.inMonth ? "border-white/[0.05] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]" : "border-transparent opacity-30",
        day.isToday && "border-volt/50 bg-volt/[0.06] shadow-[inset_0_0_0_1px_rgb(212_255_58/0.2)]",
      )}
    >
      <span className={cn("text-xs font-medium tabular-nums sm:text-sm", day.isToday ? "text-volt" : day.isFuture ? "text-fg-subtle" : "text-fg-muted")}>
        {Number(day.date.slice(8))}
      </span>

      <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5" aria-hidden>
        {day.state === "done" && <span className="block size-2.5 rounded-full bg-volt shadow-[0_0_10px_rgb(212_255_58/0.7)] sm:size-3" />}
        {day.state === "extra" && <span className="block size-2.5 rounded-full border-2 border-volt sm:size-3" />}
        {day.state === "missed" && <span className="block size-2.5 rounded-full border-2 border-ember sm:size-3" />}
        {day.state === "planned" && <span className="block size-2.5 rounded-full border border-dashed border-fg-subtle sm:size-3" />}
      </span>

      <span className="mt-auto hidden w-full space-y-0.5 sm:block" aria-hidden>
        {minutes > 0 && <span className="block truncate font-mono text-[10px] text-volt tabular-nums">{formatDuration(minutes)}</span>}
        {day.expenses.length > 0 && (
          <span className="block truncate text-[11px] leading-tight">
            {day.expenses.map((e) => CATEGORIES[e.category].emoji).join("")}
          </span>
        )}
      </span>
      {day.expenses.length > 0 && <span className="mt-auto h-1 w-full rounded-full bg-ember sm:hidden" aria-hidden />}
    </button>
  );
}
