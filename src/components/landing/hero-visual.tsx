"use client";

import { Flame, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "../ui/animated-number";
import { ProgressRing } from "../ui/progress-ring";

const SPARK = [12, 18, 18, 31, 44, 44, 38, 27, 27, 41, 58, 51];

function Float({ children, className, delay = 0, amp = 8 }: { children: React.ReactNode; className?: string; delay?: number; amp?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, -amp, 0], scale: 1 }}
      transition={
        reduce
          ? { duration: 0.6, delay }
          : { opacity: { duration: 0.8, delay }, scale: { duration: 0.8, delay }, y: { duration: 6, delay, repeat: Infinity, ease: "easeInOut" } }
      }
    >
      {children}
    </motion.div>
  );
}

/** Composition de fausses cartes d'interface : donne à voir l'app avant même de cliquer. */
export function HeroVisual() {
  const max = Math.max(...SPARK);
  const pts = SPARK.map((v, i) => `${(i / (SPARK.length - 1)) * 100},${40 - (v / max) * 36}`).join(" ");

  return (
    <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[520px]" aria-hidden>
      {/* carte dette */}
      <Float className="absolute top-[6%] left-0 w-[68%]" delay={0.15}>
        <div className="card p-6">
          <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-ember/25 blur-3xl" />
          <p className="eyebrow">Dette actuelle</p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <AnimatedNumber value={51} className="text-7xl font-semibold tracking-[-0.05em]" duration={1.6} />
            <span className="text-xl text-fg-muted">min</span>
          </p>
          <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="mt-4 h-16 w-full overflow-visible">
            <defs>
              <linearGradient id="hv" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--color-ember)" stopOpacity=".35" />
                <stop offset="1" stopColor="var(--color-ember)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,42 ${pts} 100,42`} fill="url(#hv)" />
            <motion.polyline
              points={pts}
              fill="none"
              stroke="var(--color-ember)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <p className="mt-3 inline-flex rounded-full bg-ember/12 px-2.5 py-1 text-xs font-medium text-ember-soft">🍕 +25 min · Soirée match</p>
        </div>
      </Float>

      {/* carte séance */}
      <Float className="absolute top-[38%] right-0 w-[58%]" delay={0.35} amp={10}>
        <div className="card border-volt/20 p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Prochaine séance</p>
            <span className="rounded-md bg-volt/15 px-1.5 py-0.5 font-mono text-[10px] text-volt">LUN 18:30</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <ProgressRing value={0.68} size={84} stroke={7}>
              <span className="font-pixel text-lg">86</span>
            </ProgressRing>
            <div className="text-sm">
              <p className="font-semibold">86 min recommandées</p>
              <p className="mt-1 text-xs text-fg-muted">
                60 de base + <span className="text-volt">26 de remboursement</span>
              </p>
            </div>
          </div>
        </div>
      </Float>

      {/* toast badge */}
      <Float className="absolute bottom-[6%] left-[6%] w-[62%]" delay={0.6} amp={6}>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800/95 p-3.5 shadow-2xl backdrop-blur">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber to-ember text-ink-950">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold">Badge débloqué : Ardoise propre</p>
            <p className="truncate text-xs text-fg-muted">Dette ramenée à zéro 🎉</p>
          </div>
        </div>
      </Float>

      {/* pastille série */}
      <Float className="absolute top-0 right-[6%]" delay={0.8} amp={5}>
        <div className="flex items-center gap-2 rounded-full border border-amber/30 bg-ink-850 px-3 py-2 text-sm shadow-xl">
          <Flame className="size-4 text-amber" />
          <span className="font-semibold">7</span>
          <span className="text-fg-muted">séances d&apos;affilée</span>
        </div>
      </Float>
    </div>
  );
}
