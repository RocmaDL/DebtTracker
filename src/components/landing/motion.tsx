"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PixelIcon, SPRITES, type PixelName } from "../ui/pixel-icon";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/*  Titre : chaque ligne sort de derrière un masque                    */
/* ------------------------------------------------------------------ */

export function LineReveal({
  lines,
  className,
  delay = 0,
  inView = false,
}: {
  lines: { text: ReactNode; className?: string }[];
  className?: string;
  delay?: number;
  /** Déclenche au scroll plutôt qu'au chargement. */
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-15% 0px" });
  const play = !inView || seen;
  return (
    <span ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn("block", line.className)}
            initial={reduce ? false : { y: "105%", rotate: 2 }}
            animate={play ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1, delay: delay + i * 0.11, ease: EASE }}
          >
            {line.text}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Apparition douce, déclenchée au chargement (pas au scroll). */
export function FadeUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phrase qui s'allume mot à mot au fil du scroll                     */
/* ------------------------------------------------------------------ */

export type Token = { text: string; className?: string } | { icon: PixelName; className?: string };

export function ScrollWords({ tokens, className }: { tokens: Token[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  // Chaque mot devient un jeton animé ; les icônes comptent pour un mot.
  const words = useMemo(
    () =>
      tokens.flatMap((t): Token[] =>
        "icon" in t ? [t] : t.text.split(/(?<=\s)/).map((w) => ({ text: w, className: t.className })),
      ),
    [tokens],
  );

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduce={Boolean(reduce)}>
          {"icon" in w ? (
            <PixelIcon name={w.icon} className={cn("inline size-[0.8em] -translate-y-[0.05em] align-baseline", w.className)} />
          ) : (
            <span className={w.className}>{w.text}</span>
          )}
        </Word>
      ))}
    </p>
  );
}

function Word({ progress, range, reduce, children }: { progress: MotionValue<number>; range: [number, number]; reduce: boolean; children: ReactNode }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span className="inline-block whitespace-pre" style={reduce ? undefined : { opacity, y }}>
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Pixel morph : le burger se désagrège et devient un haltère         */
/* ------------------------------------------------------------------ */

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function PixelMorph({ from, to, className }: { from: PixelName; to: PixelName; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.4"] });
  const [step, setStep] = useState(0);
  const STEPS = 30;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v)) * STEPS);
    if (next !== step) setStep(next);
  });

  const p = reduce ? 1 : step / STEPS;
  const a = SPRITES[from];
  const b = SPRITES[to];
  // Seuil propre à chaque pixel : ils basculent en désordre, comme un panneau qui se reprogramme.
  const cells = useMemo(
    () => Array.from({ length: 144 }, (_, i) => ({ i, t: 0.15 + seeded(i) * 0.7, on: [a[Math.floor(i / 12)][i % 12] === "#", b[Math.floor(i / 12)][i % 12] === "#"] })),
    [a, b],
  );

  return (
    <div ref={ref} className={className}>
      <div className="grid aspect-square w-full grid-cols-12 gap-[3px]" aria-hidden>
        {cells.map(({ i, t, on }) => {
          const flipped = p >= t;
          const lit = flipped ? on[1] : on[0];
          return (
            <span
              key={i}
              className={cn(
                "rounded-[2px] transition-[background-color,transform] duration-300",
                lit ? (flipped ? "bg-volt" : "bg-ember") : "bg-white/[0.045]",
                lit && Math.abs(p - t) < 0.06 && "scale-110",
              )}
            />
          );
        })}
      </div>
      <div className="mt-5 flex items-baseline justify-between font-pixel text-lg">
        <span className={cn("transition-colors duration-300", p < 0.5 ? "text-ember" : "text-white/15")}>+14:00</span>
        <span className="text-fg-subtle">→</span>
        <span className={cn("transition-colors duration-300", p >= 0.5 ? "text-volt" : "text-white/15")}>74 min</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bandeau défilant qui accélère avec le scroll                       */
/* ------------------------------------------------------------------ */

export function VelocityMarquee({ children, baseSpeed = 40 }: { children: ReactNode; baseSpeed?: number }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-2000, 0, 2000], [-4, 1, 5], { clamp: false });
  const skew = useTransform(velocity, [-2000, 0, 2000], [4, 0, -4]);
  const trackRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    if (reduce || !trackRef.current) return;
    const half = trackRef.current.scrollWidth / 2;
    let next = x.get() - (baseSpeed * factor.get() * delta) / 1000;
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  return (
    <motion.div ref={trackRef} className="flex w-max gap-12" style={reduce ? undefined : { x, skewX: skew }}>
      {children}
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chrono vivant : chaque chiffre roule quand il change               */
/* ------------------------------------------------------------------ */

export function LiveClock({ start = 4368, className }: { start?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const visible = useInView(ref);
  const [t, setT] = useState(start);

  useEffect(() => {
    if (reduce || !visible) return;
    const id = setInterval(() => setT((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [reduce, visible]);

  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");

  return (
    <p ref={ref} className={cn("flex font-pixel leading-[0.85] tracking-tight tabular-nums", className)} aria-hidden>
      <Digits value={h} />
      <span>:</span>
      <Digits value={m} />
      <span>:</span>
      <Digits value={s} className="text-volt" />
    </p>
  );
}

function Digits({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("flex", className)}>
      {value.split("").map((d, i) => (
        <span key={i} className="relative inline-block overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={d}
              className="inline-block"
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Filet qui se trace + contenu qui glisse, pour les listes           */
/* ------------------------------------------------------------------ */

export function DrawnRow({ children, index = 0, className }: { children: ReactNode; index?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.li
      ref={ref}
      className={cn("relative", className)}
      initial={reduce ? false : { opacity: 0, x: -16 }}
      animate={seen ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.8, delay: 0.15 + index * 0.12, ease: EASE }}
    >
      {children}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-white/[0.08]"
        initial={reduce ? false : { scaleX: 0 }}
        animate={seen ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.1, delay: index * 0.12, ease: EASE }}
      />
    </motion.li>
  );
}
