"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: ReactNode;
  tone?: "volt" | "ember";
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("relative flex rounded-2xl border border-white/8 bg-ink-800 p-1", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors",
              active ? (opt.tone === "ember" ? "text-ink-950" : opt.tone === "volt" ? "text-ink-950" : "text-fg") : "text-fg-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                className={cn(
                  "absolute inset-0 -z-10 rounded-xl",
                  opt.tone === "ember" ? "bg-ember" : opt.tone === "volt" ? "bg-volt" : "bg-ink-700",
                )}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
