"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { addDays, formatShort } from "@/lib/dates";
import type { WeekBucket } from "@/lib/engine";
import { useWidth } from "@/hooks/use-width";
import { formatDuration } from "@/lib/utils";

interface WeeklyBarsProps {
  weeks: WeekBucket[];
  /** Objectif hebdomadaire (séances planifiées × durée standard). */
  target: number;
  height?: number;
}

const PAD = { top: 20, right: 8, bottom: 26, left: 36 };

export function WeeklyBars({ weeks, target, height = 220 }: WeeklyBarsProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const max = Math.max(60, target, ...weeks.map((w) => w.minutes));
  const niceMax = Math.ceil(max / 60) * 60;
  const w = Math.max(0, width - PAD.left - PAD.right);
  const h = height - PAD.top - PAD.bottom;
  const band = w / weeks.length;
  const barW = Math.min(24, band * 0.56);
  const y = (v: number) => PAD.top + h - (v / niceMax) * h;
  const ticks = [0, niceMax / 2, niceMax];
  const active = hover !== null ? weeks[hover] : null;
  // Un libellé toutes les `every` semaines, toujours la dernière, sans collision.
  const every = Math.max(1, Math.ceil(64 / Math.max(band, 1)));
  const showLabel = (i: number) => i === weeks.length - 1 || ((weeks.length - 1 - i) % every === 0 && weeks.length - 1 - i >= every);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Minutes de sport par semaine" className="overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.06)" />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-fg-subtle font-mono text-[10px] tabular-nums">
                {t}
              </text>
            </g>
          ))}

          {target > 0 && (
            <g>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(target)} y2={y(target)} stroke="var(--color-fg-muted)" strokeOpacity={0.45} />
            </g>
          )}

          {weeks.map((wk, i) => {
            const cx = PAD.left + band * i + band / 2;
            const bh = Math.max(wk.minutes > 0 ? 4 : 0, (wk.minutes / niceMax) * h);
            const isLast = i === weeks.length - 1;
            const r = Math.min(4, bh);
            const x0 = cx - barW / 2;
            const y0 = y(0) - bh;
            const d = bh === 0 ? "" : `M${x0},${y(0)}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x0 + barW - r}Q${x0 + barW},${y0} ${x0 + barW},${y0 + r}V${y(0)}Z`;
            return (
              <g
                key={wk.weekStart}
                tabIndex={0}
                role="img"
                aria-label={`Semaine du ${formatShort(wk.weekStart)} : ${wk.minutes} minutes, ${wk.sessions} séances`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-default outline-none"
              >
                <rect x={cx - band / 2} y={PAD.top} width={band} height={h} fill="transparent" />
                {hover === i && <rect x={cx - band / 2 + 2} y={PAD.top} width={band - 4} height={h} rx={8} fill="rgb(255 255 255 / 0.03)" />}
                <motion.path
                  d={d}
                  fill={isLast ? "var(--color-volt)" : "var(--color-volt-deep)"}
                  fillOpacity={hover === null || hover === i ? 1 : 0.45}
                  initial={{ scaleY: reduce ? 1 : 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ originY: 1, transformBox: "fill-box" }}
                  transition={{ duration: 0.7, delay: reduce ? 0 : i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                />
                {showLabel(i) && (
                  <text x={cx} y={height - 6} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px]">
                    {formatShort(wk.weekStart)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-ink-750/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{ left: Math.min(Math.max(PAD.left + band * hover + band / 2, 80), width - 80) }}
        >
          <p className="font-semibold text-fg tabular-nums">{formatDuration(active.minutes)}</p>
          <p className="text-fg-subtle">
            {formatShort(active.weekStart)} → {formatShort(addDays(active.weekStart, 6))} · {active.sessions} séance{active.sessions > 1 ? "s" : ""}
          </p>
          {active.repaid > 0 && <p className="text-volt">−{active.repaid} min remboursées</p>}
        </div>
      )}
    </div>
  );
}
