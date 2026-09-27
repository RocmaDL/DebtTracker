"use client";

import { ChevronDown, Flag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ACTIVITIES, ACTIVITY_KEYS } from "@/lib/catalog";
import { today } from "@/lib/dates";
import { useApp, newId } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { cn, formatClock } from "@/lib/utils";
import { useDerived } from "@/hooks/use-derived";
import { useEntryActions } from "@/hooks/use-entry-actions";
import { Button } from "../ui/button";
import { ProgressRing } from "../ui/progress-ring";

function useElapsed(startedAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
}

/** Chrono de séance : plein écran, ou pastille flottante une fois réduit. Survit au rechargement. */
export function TimerLayer() {
  const timer = useApp((s) => s.timer);
  const expanded = useUI((s) => s.timerExpanded);
  const setExpanded = useUI((s) => s.setTimerExpanded);
  const elapsed = useElapsed(timer?.startedAt);

  return (
    <AnimatePresence>
      {timer && expanded && <TimerScreen key="screen" elapsed={elapsed} onMinimize={() => setExpanded(false)} />}
      {timer && !expanded && (
        <motion.button
          key="pill"
          type="button"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={() => setExpanded(true)}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-volt/30 bg-ink-850/95 py-2 pr-4 pl-2 shadow-[0_10px_40px_-10px_rgb(212_255_58/0.4)] backdrop-blur lg:bottom-6"
          aria-label="Afficher le chrono en cours"
        >
          <span className="relative grid size-8 place-items-center rounded-full bg-volt/15">
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-volt" />
            <span className="size-2 rounded-full bg-volt" />
          </span>
          <span className="font-pixel text-lg tabular-nums">{formatClock(elapsed)}</span>
          <span className="text-xs text-fg-muted">{ACTIVITIES[timer.activity].label}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function TimerScreen({ elapsed, onMinimize }: { elapsed: number; onMinimize: () => void }) {
  const timer = useApp((s) => s.timer)!;
  const cancelTimer = useApp((s) => s.cancelTimer);
  const setActivity = useApp((s) => s.setTimerActivity);
  const { settings, plan } = useDerived();
  const { save } = useEntryActions();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const targetSec = timer.target * 60;
  const standardSec = settings.standardDuration * 60;
  const progress = elapsed / targetSec;
  const minutes = Math.floor(elapsed / 60);
  const phase =
    elapsed >= targetSec ? "Objectif atteint 🔥" : elapsed >= standardSec ? "Tu rembourses ta dette" : "Échauffement → séance standard";
  const repaying = Math.max(0, minutes - settings.standardDuration);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onMinimize();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onMinimize]);

  const finish = () => {
    if (minutes < 1) {
      toast.error("Séance trop courte", { description: "Il faut au moins une minute pour l'enregistrer." });
      return;
    }
    save({
      id: newId(),
      kind: "session",
      date: today(),
      duration: minutes,
      activity: timer.activity,
      standard: settings.standardDuration,
      note: "Chronométrée",
      createdAt: Date.now(),
    });
    cancelTimer();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Chrono de séance"
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-ink-950"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl transition-colors duration-1000"
        style={{ background: elapsed >= standardSec ? "var(--color-volt)" : "var(--color-sky)" }}
      />

      <header className="relative flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="ghost" size="sm" onClick={onMinimize}>
          <ChevronDown className="size-4" /> Réduire
        </Button>
        <p className="eyebrow flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-ember" /> En cours
        </p>
        <Button
          variant={confirmCancel ? "danger" : "ghost"}
          size="sm"
          onClick={() => (confirmCancel ? cancelTimer() : setConfirmCancel(true))}
          onBlur={() => setConfirmCancel(false)}
        >
          <X className="size-4" /> {confirmCancel ? "Confirmer ?" : "Abandonner"}
        </Button>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <ProgressRing value={progress} size={300} stroke={10} tone={elapsed >= standardSec ? "volt" : "amber"} label="Progression vers l'objectif" className="max-sm:scale-90">
          <div className="text-center">
            <p className="font-pixel text-[4.2rem] leading-none tabular-nums" aria-live="off">
              {formatClock(elapsed)}
            </p>
            <p className="mt-3 text-sm text-fg-muted">
              objectif <strong className="text-fg">{timer.target} min</strong>
            </p>
          </div>
        </ProgressRing>

        <div className="text-center" aria-live="polite">
          <p className="text-lg font-semibold">{phase}</p>
          <p className="mt-1 text-sm text-fg-muted">
            {repaying > 0 ? (
              <>
                <span className="text-volt">−{Math.min(repaying, plan.debt)} min</span> de dette si tu t’arrêtes maintenant
              </>
            ) : (
              <>Remboursement à partir de {settings.standardDuration} min</>
            )}
          </p>
        </div>

        <div className="flex max-w-full gap-2 overflow-x-auto scrollbar-none" role="radiogroup" aria-label="Activité">
          {ACTIVITY_KEYS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={timer.activity === a}
              onClick={() => setActivity(a)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                timer.activity === a ? "border-volt/50 bg-volt/10 text-fg" : "border-white/8 text-fg-muted hover:text-fg",
              )}
            >
              <span aria-hidden>{ACTIVITIES[a].emoji}</span>
              {ACTIVITIES[a].label}
            </button>
          ))}
        </div>
      </main>

      <footer className="relative p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button size="lg" className="mx-auto flex h-16 w-full max-w-sm text-lg" onClick={finish}>
          <Flag className="size-5" /> Terminer la séance
        </Button>
      </footer>
    </motion.div>
  );
}
