"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/catalog";
import type { ExpenseCategory } from "@/lib/types";
import { cn, formatEuro } from "@/lib/utils";
import { AnimatedNumber } from "../ui/animated-number";

/** Mini-calculateur : on compose son week-end, on voit la facture en minutes. */
export function Simulator() {
  const [basket, setBasket] = useState<Partial<Record<ExpenseCategory, number>>>({ burger: 1, pizza: 1, sweet: 2 });
  const [rate, setRate] = useState(1);
  const [sessions, setSessions] = useState(3);
  const standard = 60;

  const total = CATEGORY_KEYS.reduce((s, c) => s + (basket[c] ?? 0) * CATEGORIES[c].typical, 0);
  const minutes = Math.round(total * rate);
  const perSession = Math.ceil(minutes / sessions);

  const change = (c: ExpenseCategory, delta: number) =>
    setBasket((b) => ({ ...b, [c]: Math.max(0, Math.min(9, (b[c] ?? 0) + delta)) }));

  return (
    <div className="card grid overflow-hidden lg:grid-cols-[1.2fr_1fr]">
      <div className="p-6 sm:p-8">
        <p className="eyebrow">1 · Compose ton week-end</p>
        <ul className="mt-5 grid gap-2 min-[420px]:grid-cols-2">
          {CATEGORY_KEYS.map((c) => {
            const qty = basket[c] ?? 0;
            return (
              <li
                key={c}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border p-2.5 transition",
                  qty > 0 ? "border-ember/40 bg-ember/[0.07]" : "border-white/6 bg-ink-800/60",
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {CATEGORIES[c].emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{CATEGORIES[c].label}</span>
                  <span className="block font-mono text-[10px] text-fg-subtle">{formatEuro(CATEGORIES[c].typical)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <button type="button" onClick={() => change(c, -1)} disabled={qty === 0} aria-label={`Retirer ${CATEGORIES[c].label}`} className="grid size-6 place-items-center rounded-md bg-white/5 text-fg-muted transition hover:bg-white/10 disabled:opacity-30">
                    <Minus className="size-3" />
                  </button>
                  <span className="w-4 text-center font-mono text-sm tabular-nums" aria-label={`${qty} ${CATEGORIES[c].label}`}>
                    {qty}
                  </span>
                  <button type="button" onClick={() => change(c, 1)} aria-label={`Ajouter ${CATEGORIES[c].label}`} className="grid size-6 place-items-center rounded-md bg-white/5 text-fg-muted transition hover:bg-white/10">
                    <Plus className="size-3" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow flex justify-between">
              2 · Taux <span className="text-volt normal-case">{String(rate).replace(".", ",")} min / €</span>
            </span>
            <input type="range" min={0.5} max={3} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-3 h-6 w-full" style={{ "--fill": `${((rate - 0.5) / 2.5) * 100}%` } as React.CSSProperties} />
          </label>
          <label className="block">
            <span className="eyebrow flex justify-between">
              3 · Séances restantes <span className="text-volt normal-case">{sessions}</span>
            </span>
            <input type="range" min={1} max={8} step={1} value={sessions} onChange={(e) => setSessions(Number(e.target.value))} className="mt-3 h-6 w-full" style={{ "--fill": `${((sessions - 1) / 7) * 100}%` } as React.CSSProperties} />
          </label>
        </div>
      </div>

      <div className="hairline relative flex flex-col justify-between gap-8 overflow-hidden border-t bg-ink-900/70 p-6 sm:p-8 lg:border-t-0 lg:border-l" aria-live="polite">
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-volt/10 blur-3xl" />
        <div>
          <p className="eyebrow">L&apos;addition</p>
          <p className="mt-3 text-sm text-fg-muted">{formatEuro(total)} de fast-food, soit</p>
          <p className="mt-1 flex items-baseline gap-2">
            <AnimatedNumber value={minutes} duration={0.6} className="text-7xl font-semibold tracking-[-0.05em] text-ember" />
            <span className="text-xl text-fg-muted">min de dette</span>
          </p>
        </div>
        <div className="relative">
          <p className="eyebrow">Ton plan</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: sessions }, (_, i) => (
              <span key={i} className="rounded-xl border border-volt/25 bg-volt/[0.06] px-3 py-2 text-center">
                <span className="block font-mono text-[10px] text-fg-subtle">S{i + 1}</span>
                <span className="font-pixel text-base tabular-nums">{standard + perSession}′</span>
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-fg-muted">
            {minutes === 0 ? (
              "Rien à rembourser. Semaine exemplaire."
            ) : (
              <>
                <strong className="text-fg">{perSession} min de plus</strong> à chacune de tes {sessions} prochaines séances, et l&apos;ardoise est effacée.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
