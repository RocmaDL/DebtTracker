"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { addDays, formatDayMonth, formatWeekday, monthKey, weekdayOf, capitalize } from "@/lib/dates";
import { groupByDate, isExpense, isSession } from "@/lib/engine";
import type { Entry, ISODate } from "@/lib/types";
import { cn, formatDuration, formatEuro } from "@/lib/utils";
import { useWidth } from "@/hooks/use-width";

interface ActivityHeatmapProps {
  entries: Entry[];
  today: ISODate;
  standard: number;
  onSelect?: (date: ISODate) => void;
}

const GAP = 3;
const MIN_CELL = 11;
const MAX_CELL = 22;
const LABEL_W = 30;
const TOP = 18;
const MAX_WEEKS = 20;

/** Intensité 0 → 4 selon l'effort du jour, relatif à la séance standard. */
function levelFor(minutes: number, standard: number) {
  if (minutes <= 0) return 0;
  if (minutes < standard) return 1;
  if (minutes < standard + 15) return 2;
  if (minutes < standard + 30) return 3;
  return 4;
}

const VOLT_OPACITY = [0, 0.22, 0.42, 0.68, 1];
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

interface Day {
  date: ISODate;
  minutes: number;
  spent: number;
  labels: string[];
  level: number;
  hasExpense: boolean;
}

/**
 * L'ardoise, façon graphe de contributions : une case par jour, une colonne par semaine.
 * Le vert s'intensifie avec l'effort, l'orange signale un écart sans séance.
 */
export function ActivityHeatmap({ entries, today, standard, onSelect }: ActivityHeatmapProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();

  // Autant de semaines que la largeur le permet (20 max), puis des cases qui remplissent la place.
  const weeks = width === 0 ? 0 : Math.max(8, Math.min(MAX_WEEKS, Math.floor((width - LABEL_W) / (MIN_CELL + GAP))));
  const CELL = weeks === 0 ? MIN_CELL : Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor((width - LABEL_W) / weeks) - GAP));
  const STEP = CELL + GAP;

  const { days, first, stats } = useMemo(() => {
    const byDay = groupByDate(entries);
    const currentWeekStart = addDays(today, 1 - weekdayOf(today));
    const first = addDays(currentWeekStart, -7 * (weeks - 1));
    const days: Day[] = [];
    let sessions = 0;
    let expenses = 0;
    for (let d = first; d <= today; d = addDays(d, 1)) {
      const list = byDay.get(d) ?? [];
      const s = list.filter(isSession);
      const e = list.filter(isExpense);
      sessions += s.length;
      expenses += e.length;
      const minutes = s.reduce((sum, x) => sum + x.duration, 0);
      days.push({
        date: d,
        minutes,
        spent: e.reduce((sum, x) => sum + x.amount, 0),
        labels: e.map((x) => CATEGORIES[x.category].label),
        level: levelFor(minutes, standard),
        hasExpense: e.length > 0,
      });
    }
    return { days, first, stats: { sessions, expenses } };
  }, [entries, today, weeks, standard]);

  const pos = (i: number) => ({ x: LABEL_W + Math.floor(i / 7) * STEP, y: TOP + (i % 7) * STEP });
  const height = TOP + 7 * STEP;
  const svgWidth = LABEL_W + weeks * STEP;

  // Libellés de mois au-dessus de la première colonne de chaque mois
  const monthLabels = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    let prev = "";
    for (let w = 0; w < weeks; w++) {
      const d = addDays(first, w * 7);
      const mk = monthKey(d);
      if (mk !== prev) {
        const x = LABEL_W + w * STEP;
        if (!out.length || x - out[out.length - 1].x > 28) out.push({ x, label: MONTHS[Number(mk.slice(5)) - 1] });
        prev = mk;
      }
    }
    return out;
  }, [first, weeks, STEP]);

  const current = active !== null ? days[active] : null;

  return (
    <div className="space-y-3">
      <div ref={ref} className="relative w-full">
        {weeks > 0 && (
          <svg
            width={svgWidth}
            height={height}
            role="img"
            tabIndex={0}
            aria-label={`Activité des ${weeks} dernières semaines : ${stats.sessions} séances et ${stats.expenses} écarts. Flèches pour parcourir les jours.`}
            className="overflow-visible outline-none"
            onKeyDown={(e) => {
              const i = active ?? days.length - 1;
              const move = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[e.key];
              if (move !== undefined) {
                e.preventDefault();
                setActive(Math.max(0, Math.min(days.length - 1, i + move)));
              }
              if (e.key === "Enter" && active !== null) onSelect?.(days[active].date);
            }}
            onBlur={() => setActive(null)}
            onPointerLeave={() => setActive(null)}
          >
            {monthLabels.map((m) => (
              <text key={m.x} x={m.x} y={10} className="fill-fg-subtle text-[10px]">
                {m.label}
              </text>
            ))}
            {[
              [0, "Lun"],
              [2, "Mer"],
              [4, "Ven"],
            ].map(([row, label]) => (
              <text key={label} x={0} y={TOP + (row as number) * STEP + CELL - 3} className="fill-fg-subtle text-[10px]">
                {label}
              </text>
            ))}

            {days.map((d, i) => {
              const { x, y } = pos(i);
              const isToday = d.date === today;
              const ember = d.hasExpense && d.level === 0;
              return (
                <g
                  key={d.date}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => onSelect?.(d.date)}
                  className={cn(onSelect && "cursor-pointer")}
                >
                  <motion.rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    rx={3}
                    initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: reduce ? 0 : Math.floor(i / 7) * 0.018 + (i % 7) * 0.01, duration: 0.3 }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    fill={d.level > 0 ? "var(--color-volt)" : ember ? "var(--color-ember)" : "rgb(255 255 255)"}
                    fillOpacity={d.level > 0 ? VOLT_OPACITY[d.level] : ember ? 0.55 : 0.055}
                    stroke={isToday ? "var(--color-fg)" : active === i ? "rgb(255 255 255 / 0.6)" : "none"}
                    strokeWidth={1.5}
                  />
                  {d.hasExpense && d.level > 0 && <circle cx={x + CELL - 3} cy={y + 3} r={2.2} fill="var(--color-ember)" stroke="var(--color-ink-850)" strokeWidth={1} />}
                </g>
              );
            })}
          </svg>
        )}

        {current && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-ink-750 px-3 py-2 text-xs whitespace-nowrap shadow-xl"
            style={{ left: Math.min(Math.max(pos(active!).x + CELL / 2, 90), width - 90), top: pos(active!).y - 6 }}
            aria-live="polite"
          >
            <p className="font-semibold text-fg">{capitalize(`${formatWeekday(current.date)} ${formatDayMonth(current.date)}`)}</p>
            <p className="text-fg-muted">
              {current.minutes > 0 ? <span className="text-volt">{formatDuration(current.minutes)} de sport</span> : "Pas de séance"}
              {current.hasExpense && (
                <span className="text-ember-soft">
                  {" · "}
                  {current.labels.join(", ")} {formatEuro(current.spent)}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11px] text-fg-subtle">
        <p>
          <strong className="font-medium text-fg-muted">{stats.sessions} séances</strong> et{" "}
          <strong className="font-medium text-fg-muted">{stats.expenses} écarts</strong> en {weeks} semaines
        </p>
        <div className="flex items-center gap-4" aria-hidden>
          <span className="flex items-center gap-1">
            Moins
            {VOLT_OPACITY.map((o, i) => (
              <span key={i} className="size-[11px] rounded-[3px]" style={{ background: i === 0 ? "rgb(255 255 255 / 0.055)" : `rgb(212 255 58 / ${o})` }} />
            ))}
            Plus
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-[11px] rounded-[3px] bg-ember/55" /> Écart
          </span>
        </div>
      </div>
    </div>
  );
}
