import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}

export function Field({ label, htmlFor, hint, error, children, className, aside }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-fg-muted">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-ember-soft">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass = cn(
  "h-12 w-full rounded-2xl border border-white/8 bg-ink-800 px-4 text-base text-fg placeholder:text-fg-subtle",
  "transition focus:border-volt/60 focus:bg-ink-750 focus:outline-none focus:ring-4 focus:ring-volt/10",
  "aria-[invalid=true]:border-ember/60 aria-[invalid=true]:ring-ember/10",
);
