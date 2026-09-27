"use client";

import { Flame, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { addDays } from "@/lib/dates";
import { isExpense, isSession, spendingByCategory, weeklyMinutes } from "@/lib/engine";
import { BADGES, LEVELS } from "@/lib/gamification";
import { cn, formatDuration, formatEuro, formatInt } from "@/lib/utils";
import { useDerived } from "@/hooks/use-derived";
import { WeeklyBars } from "../../charts/weekly-bars";
import { ProgressRing } from "../../ui/progress-ring";
import { BadgeIcon } from "../badge-icon";
import { PixelIcon, categoryIcon } from "@/components/ui/pixel-icon";

export function ProgressView() {
  const d = useDerived();
  const weeks = useMemo(() => weeklyMinutes(d.entries, 10, d.today), [d.entries, d.today]);
  const categories = useMemo(() => spendingByCategory(d.entries, addDays(d.today, -60), d.today), [d.entries, d.today]);
  const totals = useMemo(() => {
    const sessions = d.entries.filter(isSession);
    const expenses = d.entries.filter(isExpense);
    return {
      minutes: sessions.reduce((s, e) => s + e.duration, 0),
      sessions: sessions.length,
      spent: expenses.reduce((s, e) => s + e.amount, 0),
      repaid: d.timeline.reduce((s, p) => s + p.effectiveRepaid, 0),
    };
  }, [d.entries, d.timeline]);
  const weeklyTarget = d.settings.schedule.length * d.settings.standardDuration;
  const maxCat = Math.max(1, ...categories.map((c) => c.amount));

  return (
    <div className="space-y-5 lg:space-y-6">
      <header>
        <p className="eyebrow">Progression</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Ton parcours</h1>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Niveau */}
        <section className="card overflow-hidden p-6 sm:p-8 lg:col-span-2" aria-labelledby="lvl">
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
            <ProgressRing value={d.level.progress} size={168} stroke={12} label="Progression dans le niveau">
              <div className="text-center">
                <p className="eyebrow">Niveau</p>
                <p className="font-pixel text-6xl leading-none">{d.level.level}</p>
              </div>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <h2 id="lvl" className="text-3xl font-semibold tracking-tight">
                {d.level.name}
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                <span className="font-mono text-fg tabular-nums">{formatInt(d.level.xp)} XP</span>
                {d.level.ceil && <> · encore {formatInt(d.level.ceil - d.level.xp)} XP pour devenir <strong className="text-fg">{LEVELS[d.level.level].name}</strong></>}
              </p>
              <ol className="mt-6 flex gap-1" aria-label="Paliers">
                {LEVELS.map((l, i) => (
                  <li key={l.name} className="flex-1" title={`${l.name} · ${l.xp} XP`}>
                    <span className={cn("block h-1.5 rounded-full", i < d.level.level ? "bg-volt" : "bg-white/8")} />
                    <span className={cn("mt-2 hidden truncate text-[10px] sm:block", i === d.level.level - 1 ? "text-fg" : "text-fg-subtle")}>{l.name}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-xs text-fg-subtle">1 XP par minute de sport · les minutes de remboursement comptent double.</p>
            </div>
          </div>
        </section>

        {/* Série */}
        <section className="card flex flex-col p-6" aria-labelledby="streak">
          <h2 id="streak" className="eyebrow">
            Série
          </h2>
          <div className="mt-4 flex items-end gap-3">
            <Flame className={cn("mb-2 size-10", d.streaks.current > 0 ? "text-amber" : "text-fg-subtle")} />
            <p className="text-6xl font-semibold tracking-[-0.04em]">{d.streaks.current}</p>
            <p className="mb-2 text-sm text-fg-muted">{d.streaks.current > 1 ? "séances d’affilée" : "séance"}</p>
          </div>
          <p className="mt-3 text-sm text-fg-muted">
            Record : <strong className="text-fg">{d.streaks.best}</strong>. Seules les séances planifiées comptent ; une séance manquée remet le compteur à zéro.
          </p>
          <dl className="hairline mt-auto grid grid-cols-2 gap-4 border-t pt-5 text-sm">
            <div>
              <dt className="text-fg-subtle">Sport cumulé</dt>
              <dd className="font-semibold">{formatDuration(totals.minutes)}</dd>
            </div>
            <div>
              <dt className="text-fg-subtle">Remboursé</dt>
              <dd className="font-semibold text-volt">{formatDuration(totals.repaid)}</dd>
            </div>
            <div>
              <dt className="text-fg-subtle">Séances</dt>
              <dd className="font-semibold">{totals.sessions}</dd>
            </div>
            <div>
              <dt className="text-fg-subtle">Fast-food</dt>
              <dd className="font-semibold">{formatEuro(totals.spent)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <section className="card p-6 lg:col-span-2" aria-labelledby="weekly">
          <h2 id="weekly" className="eyebrow">
            Minutes de sport par semaine
          </h2>
          <p className="mt-1 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
            <span>10 dernières semaines</span>
            {weeklyTarget > 0 && (
              <span className="flex items-center gap-1.5 text-xs">
                <span className="h-px w-4 bg-fg-muted" aria-hidden /> objectif {weeklyTarget} min / semaine
              </span>
            )}
          </p>
          <WeeklyBars weeks={weeks} target={weeklyTarget} />
          <details className="mt-4 text-xs text-fg-subtle">
            <summary className="cursor-pointer select-none hover:text-fg">Voir les données en tableau</summary>
            <table className="mt-3 w-full text-left tabular-nums">
              <thead>
                <tr className="text-fg-muted">
                  <th className="py-1 font-medium">Semaine du</th>
                  <th className="py-1 font-medium">Séances</th>
                  <th className="py-1 font-medium">Minutes</th>
                  <th className="py-1 font-medium">Remboursé</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((w) => (
                  <tr key={w.weekStart} className="hairline border-t">
                    <td className="py-1">{w.weekStart.split("-").reverse().join("/")}</td>
                    <td>{w.sessions}</td>
                    <td>{w.minutes}</td>
                    <td>{w.repaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <section className="card p-6" aria-labelledby="cats">
          <h2 id="cats" className="eyebrow">
            Tes faiblesses
          </h2>
          <p className="mt-1 mb-5 text-sm text-fg-muted">Dépenses par catégorie · 60 derniers jours</p>
          {categories.length === 0 ? (
            <p className="text-sm text-fg-subtle">Aucun écart sur la période.</p>
          ) : (
            <ul className="space-y-4">
              {categories.map((c, i) => (
                <li key={c.category}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span>
                      <PixelIcon name={categoryIcon(c.category)} className="mr-1.5 inline size-4 align-[-2px] text-ember" /> {CATEGORIES[c.category].label}
                      <span className="ml-1.5 text-xs text-fg-subtle">×{c.count}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums">{formatEuro(c.amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className={cn("h-full rounded-full", i === 0 ? "bg-ember" : "bg-ember/45")}
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.amount / maxCat) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="badges">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="badges" className="text-xl font-semibold tracking-tight">
            Badges
          </h2>
          <p className="font-mono text-sm text-fg-subtle tabular-nums">
            {d.badges.size} / {BADGES.length}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {BADGES.map((b, i) => {
            const unlocked = d.badges.has(b.id);
            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn("card flex flex-col gap-4 p-4 sm:p-5", !unlocked && "bg-ink-900 [&]:shadow-none")}
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-xl",
                    unlocked ? "bg-amber text-ink-950" : "border border-dashed border-white/12 text-fg-subtle",
                  )}
                >
                  {unlocked ? <BadgeIcon icon={b.icon} className="size-5" strokeWidth={2.2} /> : <Lock className="size-4" />}
                </span>
                <div>
                  <p className={cn("font-semibold", !unlocked && "text-fg-muted")}>{b.name}</p>
                  <p className="mt-0.5 text-xs text-fg-subtle">{b.description}</p>
                </div>
                <span className="sr-only">{unlocked ? "Débloqué" : "Verrouillé"}</span>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
