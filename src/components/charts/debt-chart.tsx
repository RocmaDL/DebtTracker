"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { formatShort } from "@/lib/dates";
import type { TimelinePoint } from "@/lib/engine";
import { useWidth } from "@/hooks/use-width";
import { formatDuration } from "@/lib/utils";

interface DebtChartProps {
  points: TimelinePoint[];
  height?: number;
}

const PAD = { top: 16, right: 12, bottom: 26, left: 36 };

function niceMax(v: number) {
  if (v <= 10) return 10;
  const step = v <= 60 ? 15 : v <= 120 ? 30 : 60;
  return Math.ceil(v / step) * step;
}

/** Évolution de la dette : aire + ligne, réticule qui s'accroche au jour le plus proche. */
export function DebtChart({ points, height = 200 }: DebtChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const gradId = useId();

  const geo = useMemo(() => {
    if (width === 0 || points.length === 0) return null;
    const max = niceMax(Math.max(...points.map((p) => p.balance)));
    const w = width - PAD.left - PAD.right;
    const h = height - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (points.length === 1 ? w / 2 : (i / (points.length - 1)) * w);
    const y = (v: number) => PAD.top + h - (v / max) * h;
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.balance).toFixed(1)}`).join("");
    const area = `${line}L${x(points.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
    const ticks = [0, max / 2, max];
    const labelEvery = Math.ceil(points.length / Math.max(2, Math.floor(w / 70)));
    return { max, x, y, line, area, ticks, labelEvery };
  }, [points, width, height]);

  const active = hover ?? points.length - 1;
  const p = points[active];

  const onMove = (clientX: number, rect: DOMRect) => {
    if (!geo) return;
    const rel = (clientX - rect.left - PAD.left) / (width - PAD.left - PAD.right);
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(rel * (points.length - 1)))));
  };

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {geo && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Évolution de la dette sur ${points.length} jours, de ${points[0].balance} à ${points.at(-1)?.balance} minutes`}
          tabIndex={0}
          className="overflow-visible outline-none"
          onPointerMove={(e) => onMove(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setHover(Math.max(0, active - 1));
            if (e.key === "ArrowRight") setHover(Math.min(points.length - 1, active + 1));
          }}
          onBlur={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ember)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-ember)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {geo.ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={geo.y(t)} y2={geo.y(t)} stroke="rgb(255 255 255 / 0.06)" />
              <text x={PAD.left - 8} y={geo.y(t)} dy="0.32em" textAnchor="end" className="fill-fg-subtle font-mono text-[10px] tabular-nums">
                {Math.round(t)}
              </text>
            </g>
          ))}

          {points.map((pt, i) =>
            (i % geo.labelEvery === 0 && points.length - 1 - i >= geo.labelEvery) || i === points.length - 1 ? (
              <text key={pt.date} x={geo.x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} className="fill-fg-subtle font-mono text-[10px]">
                {formatShort(pt.date)}
              </text>
            ) : null,
          )}

          <motion.path
            d={geo.area}
            fill={`url(#${gradId})`}
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.path
            d={geo.line}
            fill="none"
            stroke="var(--color-ember)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* réticule */}
          <line x1={geo.x(active)} x2={geo.x(active)} y1={PAD.top} y2={geo.y(0)} stroke="rgb(255 255 255 / 0.18)" />
          <circle cx={geo.x(active)} cy={geo.y(p.balance)} r={5} fill="var(--color-ember)" stroke="var(--color-ink-850)" strokeWidth={2} />
        </svg>
      )}

      {geo && p && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-ink-750/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{ left: Math.min(Math.max(geo.x(active), 70), width - 70) }}
          aria-live="polite"
        >
          <p className="font-semibold text-fg tabular-nums">{formatDuration(p.balance)} de dette</p>
          <p className="text-fg-subtle">
            {formatShort(p.date)}
            {p.added > 0 && <span className="text-ember-soft"> · +{p.added}</span>}
            {p.effectiveRepaid > 0 && <span className="text-volt"> · −{p.effectiveRepaid}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
