"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Feuille modale basée sur <dialog> natif : piège de focus, Échap et
 * inertie du reste de la page gérés par le navigateur.
 * Bottom-sheet sur mobile, fenêtre centrée à partir de `sm`.
 */
export function Sheet({ open, onClose, title, description, eyebrow, children, footer, className }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "sheet m-0 mt-auto w-full max-w-none bg-transparent p-0 text-fg backdrop:bg-transparent",
        "sm:m-auto sm:w-[min(560px,calc(100vw-2rem))]",
        "max-h-[92dvh] overflow-visible",
      )}
    >
      <div
        className={cn(
          "card flex max-h-[92dvh] flex-col overflow-hidden rounded-b-none border-b-0 bg-ink-900 sm:rounded-b-[var(--radius-card)] sm:border-b",
          className,
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15 sm:hidden" aria-hidden />
        <header className="flex items-start gap-4 px-5 pt-4 pb-3 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-balance">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-fg-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/5 text-fg-muted transition hover:bg-white/10 hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">{children}</div>
        {footer && (
          <footer className="hairline flex items-center gap-3 border-t bg-ink-900/80 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
