"use client";

import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { DEFAULT_SETTINGS, LIMITS } from "@/lib/catalog";
import { WEEKDAYS_LONG, WEEKDAYS_SHORT } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { Settings, Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Field, inputClass } from "../ui/field";
import { Logo } from "../ui/logo";
import { PixelIcon, type PixelName } from "@/components/ui/pixel-icon";

const STEPS = ["Bienvenue", "Conversion", "Séance type", "Planning"] as const;

export function Onboarding() {
  const loadDemo = useApp((s) => s.loadDemo);
  const startFresh = useApp((s) => s.startFresh);
  const current = useApp((s) => s.settings);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [draft, setDraft] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...current, name: current.name === "Léo" ? "" : current.name }));

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };
  const canNext = step !== 3 || draft.schedule.length > 0;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="led-matrix pointer-events-none absolute inset-x-0 top-0 h-80 [mask-image:linear-gradient(black,transparent)]" />

      <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Retour au site">
          <Logo />
        </Link>
        {step > 0 && (
          <ol className="flex items-center gap-1.5" aria-label={`Étape ${step} sur 3`}>
            {STEPS.slice(1).map((label, i) => (
              <li key={label} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500", i + 1 === step ? "w-8 bg-volt" : i + 1 < step ? "w-3 bg-volt/50" : "w-3 bg-white/15")}>
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ol>
        )}
      </header>

      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 pb-10 sm:px-8">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.section
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            aria-labelledby={`step-${step}`}
          >
            {step === 0 && <Welcome onDemo={loadDemo} onSetup={() => go(1)} />}
            {step === 1 && <RateStep draft={draft} setDraft={setDraft} />}
            {step === 2 && <StandardStep draft={draft} setDraft={setDraft} />}
            {step === 3 && <ScheduleStep draft={draft} setDraft={setDraft} />}
          </motion.section>
        </AnimatePresence>

        {step > 0 && (
          <div className="mt-10 flex items-center gap-3">
            <Button variant="ghost" size="lg" onClick={() => go(step - 1)}>
              <ArrowLeft className="size-4" /> Retour
            </Button>
            {step < 3 ? (
              <Button size="lg" className="ml-auto" onClick={() => go(step + 1)}>
                Continuer <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button size="lg" className="ml-auto" disabled={!canNext} onClick={() => startFresh({ ...draft, name: draft.name.trim() })}>
                <Check className="size-4" /> C’est parti
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Welcome({ onDemo, onSetup }: { onDemo: () => void; onSetup: () => void }) {
  return (
    <div>
      <h1 id="step-0" className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Chaque écart se paie. <span className="text-fg-muted">En minutes.</span>
      </h1>
      <p className="mt-4 max-w-md text-fg-muted">
        Un burger devient une dette de sport. Tes séances plus longues que d’habitude la remboursent, et l’app répartit
        le reste sur ton planning.
      </p>

      <div className="card mt-8 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 p-4 text-center sm:p-5" aria-label="Exemple : 14 euros de burger donnent 14 minutes de dette, remboursées par une séance de 74 minutes au lieu de 60">
        <Equation icon="burger" value="14 €" label="dépensés" delay={0.1} />
        <ArrowRight className="size-4 text-fg-subtle" aria-hidden />
        <Equation icon="clock" value="14 min" label="de dette" tone="text-ember" delay={0.35} />
        <ArrowRight className="size-4 text-fg-subtle" aria-hidden />
        <Equation icon="gym" value="74 min" label="au lieu de 60" tone="text-volt" delay={0.6} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button size="lg" onClick={onDemo} className="h-auto flex-col items-start gap-1 py-4 text-left whitespace-normal">
          <span className="flex items-center gap-2">
            <Sparkles className="size-4" /> Explorer la démo
          </span>
          <span className="text-xs font-normal opacity-70">16 semaines de données fictives · recommandé</span>
        </Button>
        <Button size="lg" variant="secondary" onClick={onSetup} className="h-auto flex-col items-start gap-1 py-4 text-left whitespace-normal">
          <span className="flex items-center gap-2">
            Configurer mon profil <ArrowRight className="size-4" />
          </span>
          <span className="text-xs font-normal text-fg-muted">Partir de zéro en 3 étapes</span>
        </Button>
      </div>
      <p className="mt-5 text-xs text-fg-subtle">Tout reste sur ton appareil. Rien n’est envoyé nulle part.</p>
    </div>
  );
}

function Equation({ icon, value, label, tone, delay }: { icon: PixelName; value: string; label: string; tone?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <PixelIcon name={icon} className={cn("mx-auto size-7", tone ?? "text-fg")} />
      <div className={cn("mt-1 font-semibold tabular-nums", tone)}>{value}</div>
      <div className="text-[11px] text-fg-subtle">{label}</div>
    </motion.div>
  );
}

type StepProps = { draft: Settings; setDraft: React.Dispatch<React.SetStateAction<Settings>> };

function RangeField({ id, label, value, min, max, step, onChange, suffix }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; suffix: string }) {
  return (
    <Field label={label} htmlFor={id} aside={<span className="font-mono text-sm font-semibold text-volt tabular-nums">{String(value).replace(".", ",")} {suffix}</span>}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full"
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
      />
      <div className="flex justify-between font-mono text-[10px] text-fg-subtle">
        <span>{String(min).replace(".", ",")}</span>
        <span>{String(max).replace(".", ",")}</span>
      </div>
    </Field>
  );
}

function RateStep({ draft, setDraft }: StepProps) {
  const menu = 12;
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">Étape 1 · Conversion</p>
        <h1 id="step-1" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Combien vaut un euro ?
        </h1>
        <p className="mt-3 text-fg-muted">Choisis combien de minutes de sport coûte chaque euro de fast-food.</p>
      </div>
      <Field label="Ton prénom (optionnel)" htmlFor="name">
        <input id="name" className={inputClass} value={draft.name} maxLength={24} placeholder="Léo" onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
      </Field>
      <RangeField id="rate" label="Taux de conversion" value={draft.rate} {...LIMITS.rate} suffix="min / €" onChange={(rate) => setDraft((d) => ({ ...d, rate }))} />
      <div className="card flex items-center gap-4 p-4" aria-live="polite">
        <PixelIcon name="burger" className="size-8 text-ember" />
        <p className="text-sm text-fg-muted">
          Un menu à <strong className="text-fg">{menu} €</strong> ={" "}
          <strong className="text-ember">{Math.round(menu * draft.rate)} minutes</strong> de sport en plus.
        </p>
      </div>
    </div>
  );
}

function StandardStep({ draft, setDraft }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">Étape 2 · Séance type</p>
        <h1 id="step-2" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ta séance habituelle dure…
        </h1>
        <p className="mt-3 text-fg-muted">
          C’est ta base : elle ne rembourse rien. Seules les minutes <em className="text-fg not-italic">au-delà</em> réduisent ta dette.
        </p>
      </div>
      <RangeField id="standard" label="Durée standard" value={draft.standardDuration} {...LIMITS.standard} suffix="min" onChange={(standardDuration) => setDraft((d) => ({ ...d, standardDuration }))} />
      <div className="card space-y-3 p-4" aria-hidden>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          <div className="bg-fg-subtle/50" style={{ width: `${(draft.standardDuration / (draft.standardDuration + 20)) * 100}%` }} />
          <div className="flex-1 bg-volt" />
        </div>
        <p className="text-sm text-fg-muted">
          Une séance de <strong className="text-fg">{draft.standardDuration + 20} min</strong> rembourse{" "}
          <strong className="text-volt">20 min</strong>.
        </p>
      </div>
    </div>
  );
}

function ScheduleStep({ draft, setDraft }: StepProps) {
  const toggle = (day: Weekday) =>
    setDraft((d) => ({
      ...d,
      schedule: d.schedule.some((s) => s.day === day)
        ? d.schedule.filter((s) => s.day !== day)
        : [...d.schedule, { day, time: "18:30" }].sort((a, b) => a.day - b.day),
    }));
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">Étape 3 · Planning</p>
        <h1 id="step-3" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Quand t’entraînes-tu ?
        </h1>
        <p className="mt-3 text-fg-muted">La dette sera répartie sur ces séances. Tu pourras tout changer plus tard.</p>
      </div>
      <ScheduleEditor schedule={draft.schedule} onToggle={toggle} onTime={(day, time) => setDraft((d) => ({ ...d, schedule: d.schedule.map((s) => (s.day === day ? { ...s, time } : s)) }))} />
      {draft.schedule.length === 0 && (
        <p role="alert" className="text-sm text-ember-soft">
          Choisis au moins un jour pour continuer.
        </p>
      )}
    </div>
  );
}

export function ScheduleEditor({
  schedule,
  onToggle,
  onTime,
}: {
  schedule: Settings["schedule"];
  onToggle: (day: Weekday) => void;
  onTime: (day: Weekday, time: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Jours d’entraînement">
        {WEEKDAYS_SHORT.map((label, i) => {
          const day = (i + 1) as Weekday;
          const on = schedule.some((s) => s.day === day);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              aria-label={WEEKDAYS_LONG[i]}
              onClick={() => onToggle(day)}
              className={cn(
                "flex h-12 flex-col items-center justify-center rounded-xl border text-sm font-semibold transition sm:h-14",
                on ? "border-volt bg-volt text-ink-950" : "border-white/8 bg-ink-800 text-fg-muted hover:border-white/20 hover:text-fg",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <AnimatePresence initial={false}>
        {schedule.map((s) => (
          <motion.div
            key={s.day}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-ink-850 px-4 py-2.5">
              <span className="text-sm font-medium">{WEEKDAYS_LONG[s.day - 1]}</span>
              <input type="time" value={s.time} onChange={(e) => onTime(s.day, e.target.value)} className="rounded-lg bg-ink-750 px-2.5 py-1.5 font-mono text-sm tabular-nums" aria-label={`Heure du ${WEEKDAYS_LONG[s.day - 1].toLowerCase()}`} />
            </label>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export { RangeField };
