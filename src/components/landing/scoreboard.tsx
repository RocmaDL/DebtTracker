"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ExpenseCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PixelIcon } from "../ui/pixel-icon";

interface Scenario {
  items: { category: ExpenseCategory; label: string; price: string; minutes: number }[];
  day: string;
}

/** Taux 1 min/€, séance standard 60 min : les chiffres sont exacts. */
const SCENARIOS: Scenario[] = [
  {
    items: [
      { category: "burger", label: "Burger", price: "13,90 €", minutes: 14 },
      { category: "pizza", label: "Pizza", price: "16,50 €", minutes: 17 },
    ],
    day: "Lun",
  },
  {
    items: [
      { category: "tacos", label: "Tacos XL", price: "9,50 €", minutes: 10 },
      { category: "sushi", label: "Sushis", price: "18,00 €", minutes: 18 },
    ],
    day: "Mer",
  },
  {
    items: [
      { category: "kebab", label: "Kebab", price: "8,50 €", minutes: 9 },
      { category: "sweet", label: "Donuts", price: "4,50 €", minutes: 5 },
    ],
    day: "Sam",
  },
];

const STANDARD = 60;
/** Étapes : 0 éteint · 1-2 dépenses · 3 dette · 4 séance · 5 compte à rebours · 6 pause */
const STEP_MS = [700, 900, 900, 900, 1100, 1600, 2600];
const clock = (m: number) => `${String(Math.floor(m)).padStart(2, "0")}:00`;

/**
 * Tableau d’affichage LED : rejoue le calcul du produit, ligne par ligne.
 * Les caractères « éteints » restent visibles en fantôme, comme sur un vrai panneau.
 */
export function Scoreboard() {
  const reduce = useReducedMotion();
  const [scenario, setScenario] = useState(0);
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const s = SCENARIOS[scenario];
  const debt = s.items.reduce((sum, i) => sum + i.minutes, 0);
  const shownStep = reduce ? 6 : step;

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => {
      if (step === 6) {
        setScenario((i) => (i + 1) % SCENARIOS.length);
        setStep(0);
        setCountdown(null);
      } else setStep(step + 1);
    }, STEP_MS[step]);
    return () => clearTimeout(id);
  }, [step, reduce]);

  // Compte à rebours de la dette vers 00:00 pendant l’étape 5
  useEffect(() => {
    if (reduce || step !== 5) return;
    let v = debt;
    const id = setInterval(() => {
      v = Math.max(0, v - Math.ceil(debt / 12));
      setCountdown(v);
      if (v === 0) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [step, debt, reduce]);

  const balance = shownStep >= 5 ? (countdown ?? (reduce ? 0 : debt)) : shownStep >= 3 ? debt : null;

  return (
    <figure
      className="led-matrix relative overflow-hidden rounded-lg border border-white/10 font-pixel select-none"
      aria-label={`Exemple : ${s.items.map((i) => `${i.label} ${i.price}, ${i.minutes} minutes`).join(" ; ")}. Dette ${debt} minutes, remboursée par une séance de ${STANDARD + debt} minutes.`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs text-fg-subtle sm:px-6">
        <span>Tableau des scores</span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 animate-blink rounded-full bg-ember motion-reduce:animate-none" aria-hidden />
          En direct
        </span>
      </div>

      <div className="space-y-1 px-5 py-5 sm:px-6" aria-hidden>
        {s.items.map((item, i) => (
          <Row key={item.label} lit={shownStep >= i + 1} icon={item.category} label={item.label} middle={item.price} value={`+${clock(item.minutes)}`} tone="text-ember" />
        ))}

        <div className="my-3 border-t border-dashed border-white/10" />

        <Row lit={shownStep >= 3} label="Dette" value={clock(debt)} tone="text-ember" />
        <Row lit={shownStep >= 4} icon="gym" label={`Séance ${s.day}`} middle={`${STANDARD + debt} min`} value={`−${clock(debt)}`} tone="text-volt" />
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-white/10 px-5 pt-4 pb-5 sm:px-6" aria-hidden>
        <span className={cn("text-sm transition-colors duration-300", shownStep >= 3 ? "text-fg-muted" : "text-white/[0.07]")}>Solde</span>
        <span
          className={cn(
            "text-[clamp(3.5rem,9vw,5.5rem)] leading-none tabular-nums transition-colors duration-300",
            balance === null ? "text-white/[0.07]" : balance === 0 ? "text-volt" : "text-ember",
          )}
        >
          {clock(balance ?? 0)}
        </span>
      </div>
    </figure>
  );
}

function Row({ lit, icon, label, middle, value, tone }: { lit: boolean; icon?: "gym" | ExpenseCategory; label: string; middle?: string; value: string; tone: string }) {
  return (
    <div className={cn("grid grid-cols-[1.5rem_1fr_auto_5.5rem] items-center gap-3 py-1 text-[15px] transition-colors duration-200 sm:text-lg", lit ? "text-fg" : "text-white/[0.07]")}>
      <span className={cn(lit && tone)}>{icon && <PixelIcon name={icon} className="size-5" />}</span>
      <span className="truncate uppercase">{label}</span>
      <span className={cn("tabular-nums", lit ? "text-fg-muted" : "")}>{middle}</span>
      <span className={cn("text-right tabular-nums", lit && tone)}>{value}</span>
    </div>
  );
}
