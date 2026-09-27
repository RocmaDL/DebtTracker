"use client";

import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, CalendarClock, Flame, Play, Plus, Sparkles, Timer } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import { addDays, formatRelative, formatWeekday, formatDayMonth, capitalize } from "@/lib/dates";
import { monthRange, summarize } from "@/lib/engine";
import { BADGES } from "@/lib/gamification";
import { useApp } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { cn, formatDuration, formatEuro, plural } from "@/lib/utils";
import { useDerived } from "@/hooks/use-derived";
import { DebtChart } from "../../charts/debt-chart";
import { AnimatedNumber } from "../../ui/animated-number";
import { Button } from "../../ui/button";
import { ProgressRing } from "../../ui/progress-ring";
import { BadgeIcon } from "../badge-icon";
import { EntryRow } from "../entry-row";
import { PixelIcon } from "@/components/ui/pixel-icon";

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function DashboardView() {
  const d = useDerived();
  const open = useUI((s) => s.open);
  const setTimerExpanded = useUI((s) => s.setTimerExpanded);
  const timer = useApp((s) => s.timer);
  const startTimer = useApp((s) => s.startTimer);

  const [from, to] = monthRange(d.today);
  const month = useMemo(() => summarize(d.entries, d.settings, from, to, d.today), [d.entries, d.settings, from, to, d.today]);
  const last30 = useMemo(() => d.timeline.filter((p) => p.date > addDays(d.today, -30)), [d.timeline, d.today]);
  const recent = useMemo(() => [...d.entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5), [d.entries]);
  const nextBadge = BADGES.find((b) => !d.badges.has(b.id));

  const delta = d.debt - d.debtWeekAgo;
  const repaidMonth = d.timeline.filter((p) => p.date >= from).reduce((s, p) => s + p.effectiveRepaid, 0);
  const ratio = d.debt === 0 ? 1 : repaidMonth / (repaidMonth + d.debt);
  const isNextToday = d.plan.next?.date === d.today;
  const target = d.debt > 0 ? d.plan.recommended : d.settings.standardDuration;

  const launch = () => {
    if (!timer) startTimer("gym", target);
    setTimerExpanded(true);
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <motion.header initial="hidden" animate="show" custom={0} variants={rise} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{capitalize(`${formatWeekday(d.today)} ${formatDayMonth(d.today)}`)}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            {greeting()}
            {d.settings.name ? `, ${d.settings.name}` : ""}.
          </h1>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="secondary" onClick={() => open({ type: "entry", kind: "expense" })}>
            <Plus className="size-4 text-ember" /> Écart
          </Button>
          <Button variant="secondary" onClick={() => open({ type: "entry", kind: "session" })}>
            <Plus className="size-4 text-volt" /> Séance
          </Button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        {/* ---------- Dette (héros) ---------- */}
        <motion.section
          initial="hidden"
          animate="show"
          custom={1}
          variants={rise}
          aria-labelledby="debt-title"
          className="card overflow-hidden p-6 sm:p-8 lg:col-span-3"
        >
          <div className="relative flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h2 id="debt-title" className="eyebrow">
                {d.debt > 0 ? "Dette actuelle" : "Ardoise propre"}
              </h2>
              <p className="mt-3 flex items-baseline gap-2">
                <AnimatedNumber value={d.debt} className="text-7xl font-semibold tracking-[-0.04em] sm:text-8xl" />
                <span className="text-2xl font-medium text-fg-muted">min</span>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {delta !== 0 ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium tabular-nums",
                      delta > 0 ? "bg-ember/12 text-ember-soft" : "bg-volt/12 text-volt",
                    )}
                  >
                    {delta > 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    {delta > 0 ? "+" : "−"}
                    {Math.abs(delta)} min
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-white/5 px-2.5 py-1 font-medium text-fg-muted">stable</span>
                )}
                <span className="text-fg-subtle">sur 7 jours</span>
              </div>
            </div>
            <ProgressRing value={ratio} size={112} stroke={9} tone={d.debt > 0 ? "volt" : "volt"} label="Part de la dette du mois remboursée" className="hidden shrink-0 sm:grid">
              <div className="text-center">
                <p className="text-xl font-semibold tabular-nums">{Math.round(ratio * 100)}%</p>
                <p className="text-[10px] text-fg-subtle">remboursé</p>
              </div>
            </ProgressRing>
          </div>

          <p className="relative mt-6 max-w-md text-sm text-fg-muted">
            {d.debt > 0 ? (
              <>
                Soit environ <strong className="text-fg">{formatEuro(d.debt / d.settings.rate)}</strong> de fast-food pas encore
                remboursés. {repaidMonth > 0 && <>Déjà <strong className="text-volt">{repaidMonth} min</strong> effacées ce mois-ci.</>}
              </>
            ) : (
              <>Aucune minute due. Chaque séance compte pour ta série et ton XP : garde le rythme.</>
            )}
          </p>

          <div className="relative mt-6 -mb-2">
            {last30.length > 1 ? (
              <DebtChart points={last30} height={150} />
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-fg-subtle">
                L’évolution de ta dette apparaîtra ici après tes premières entrées.
              </p>
            )}
          </div>
        </motion.section>

        {/* ---------- Prochaine séance ---------- */}
        <motion.section initial="hidden" animate="show" custom={2} variants={rise} aria-labelledby="next-title" className="card flex flex-col p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 id="next-title" className="eyebrow">
              Prochaine séance
            </h2>
            <CalendarClock className="size-4 text-fg-subtle" />
          </div>

          {d.plan.next ? (
            <>
              <p className="mt-3 text-lg font-medium">
                {formatRelative(d.plan.next.date, d.today)} <span className="text-fg-subtle">· {d.plan.next.time}</span>
              </p>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="text-6xl font-semibold tracking-[-0.04em]">{target}</span>
                <span className="text-lg text-fg-muted">min</span>
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                  <div className="bg-fg-subtle/50" style={{ width: `${(d.settings.standardDuration / target) * 100}%` }} />
                  {d.debt > 0 && <div className="flex-1 bg-volt" />}
                </div>
                <p className="text-xs text-fg-muted">
                  {d.settings.standardDuration} min de base
                  {d.debt > 0 && (
                    <>
                      {" "}+ <span className="text-volt">{d.plan.bonus} min de remboursement</span> × {d.plan.slots.length}{" "}
                      {plural(d.plan.slots.length, "séance")}
                    </>
                  )}
                </p>
              </div>

              {(d.plan.heavy || d.plan.spillsOver) && d.debt > 0 && (
                <p className="mt-4 flex gap-2 rounded-lg border border-amber/25 bg-amber/[0.07] p-3 text-xs text-amber">
                  <AlertTriangle className="size-4 shrink-0" />
                  {d.plan.heavy
                    ? "Séance très longue : ajoute un créneau dans ton planning pour étaler l’effort."
                    : "Plus de séance planifiée ce mois-ci : la dette est répartie sur les prochaines."}
                </p>
              )}

              <div className="mt-auto flex gap-2 pt-6">
                {isNextToday || timer ? (
                  <Button className="flex-1" onClick={launch}>
                    {timer ? <Timer className="size-4" /> : <Play className="size-4" />} {timer ? "Reprendre le chrono" : "Lancer le chrono"}
                  </Button>
                ) : (
                  <Button variant="secondary" className="flex-1" onClick={launch}>
                    <Play className="size-4" /> Séance maintenant
                  </Button>
                )}
              </div>

              {d.plan.slots.length > 1 && (
                <ol className="hairline mt-5 flex gap-2 overflow-x-auto border-t pt-4 scrollbar-none" aria-label="Séances restantes ce mois-ci">
                  {d.plan.slots.map((s, i) => (
                    <li
                      key={s.date}
                      className={cn("shrink-0 rounded-lg border px-3 py-2 text-center", i === 0 ? "border-volt/40 bg-volt/[0.07]" : "border-white/8")}
                    >
                      <p className="font-mono text-[10px] text-fg-subtle uppercase">{formatWeekday(s.date).slice(0, 3)}</p>
                      <p className="text-sm font-semibold tabular-nums">{s.date.slice(8)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </>
          ) : (
            <div className="mt-4 flex flex-1 flex-col items-start gap-4">
              <p className="text-sm text-fg-muted">Aucun jour d’entraînement n’est planifié.</p>
              <Link href="/app/reglages#planning" className="text-sm font-medium text-volt hover:underline">
                Configurer mon planning →
              </Link>
            </div>
          )}
        </motion.section>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        <Stat i={3} label="Série en cours" value={`${d.streaks.current}`} unit={plural(d.streaks.current, "séance")} icon={<Flame className={cn("size-4", d.streaks.current > 0 ? "text-amber" : "text-fg-subtle")} />} foot={`Record : ${d.streaks.best}`} />
        <Stat
          i={4}
          label={`Niveau ${d.level.level}`}
          value={d.level.name}
          icon={<Sparkles className="size-4 text-volt" />}
          foot={
            <span className="block">
              <span className="mb-1.5 block h-1 overflow-hidden rounded-full bg-white/8">
                <span className="block h-full rounded-full bg-volt" style={{ width: `${d.level.progress * 100}%` }} />
              </span>
              {d.level.ceil ? `${d.level.ceil - d.level.xp} XP avant le niveau suivant` : "Niveau maximum"}
            </span>
          }
        />
        <Stat i={5} label="Séances ce mois" value={`${month.sessions}`} unit={`/ ${month.scheduled} prévues`} foot={month.missed > 0 ? `${month.missed} ${plural(month.missed, "manquée")}` : "Aucune manquée"} />
        <Stat i={6} label="Fast-food ce mois" value={formatEuro(month.spent)} foot={`${month.expenses} ${plural(month.expenses, "écart")} · ${formatDuration(month.debtAdded)}`} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        {/* ---------- Activité récente ---------- */}
        <motion.section initial="hidden" animate="show" custom={7} variants={rise} aria-labelledby="recent-title" className="card p-4 sm:p-6 lg:col-span-3">
          <div className="mb-2 flex items-center justify-between px-2 sm:px-0">
            <h2 id="recent-title" className="eyebrow">
              Activité récente
            </h2>
            <Link href="/app/historique" className="flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-fg">
              Tout voir <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="-mx-1 sm:-mx-3">
              {recent.map((e) => (
                <EntryRow key={e.id} entry={e} rate={d.settings.rate} meta={formatRelative(e.date, d.today)} onClick={() => open({ type: "entry", kind: e.kind, entry: e })} />
              ))}
            </div>
          ) : (
            <EmptyRecent onAdd={() => open({ type: "quick" })} />
          )}
        </motion.section>

        {/* ---------- Prochain badge ---------- */}
        <motion.section initial="hidden" animate="show" custom={8} variants={rise} aria-labelledby="badge-title" className="card flex flex-col p-6 lg:col-span-2">
          <h2 id="badge-title" className="eyebrow">
            Prochain objectif
          </h2>
          {nextBadge ? (
            <div className="mt-5 flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-xl border border-dashed border-amber/40 bg-amber/[0.06]">
                <BadgeIcon icon={nextBadge.icon} className="size-7 text-amber" />
              </span>
              <div>
                <p className="font-semibold">{nextBadge.name}</p>
                <p className="text-sm text-fg-muted">{nextBadge.description}</p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-fg-muted">Tous les badges sont débloqués. Respect.</p>
          )}
          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between text-xs text-fg-subtle">
              <span>Collection</span>
              <span className="font-mono tabular-nums">
                {d.badges.size} / {BADGES.length}
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {BADGES.map((b) => (
                <span key={b.id} className={cn("h-1.5 flex-1 rounded-full", d.badges.has(b.id) ? "bg-amber" : "bg-white/8")} />
              ))}
            </div>
            <Link href="/app/progression" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fg-muted hover:text-fg">
              Voir la progression <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Stat({ i, label, value, unit, icon, foot }: { i: number; label: string; value: string; unit?: string; icon?: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <motion.div initial="hidden" animate="show" custom={i} variants={rise} className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow truncate">{label}</p>
        {icon}
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
        {value} {unit && <span className="text-sm font-normal text-fg-subtle">{unit}</span>}
      </p>
      {foot && <div className="mt-2 text-xs text-fg-subtle">{foot}</div>}
    </motion.div>
  );
}

function EmptyRecent({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <span className="led-matrix grid size-16 place-items-center rounded-lg text-volt">
        <PixelIcon name="misc" className="size-8" />
      </span>
      <p className="font-medium">Rien pour l’instant</p>
      <p className="max-w-xs text-sm text-fg-muted">Ajoute ton premier écart ou ta première séance pour lancer le compteur.</p>
      <Button size="sm" onClick={onAdd}>
        <Plus className="size-4" /> Nouvelle entrée
      </Button>
    </div>
  );
}
