"use client";

import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}

/** Nombre qui « roule » jusqu'à sa nouvelle valeur. */
export function AnimatedNumber({ value, format = (n) => String(Math.round(n)), className, duration = 1.1 }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => format(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduce, mv, duration]);

  return (
    <motion.span className={className} aria-label={format(value)}>
      {text}
    </motion.span>
  );
}
