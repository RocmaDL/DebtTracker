"use client";

import { FlaskConical, Info } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/store";

/** Rappel permanent : projet vitrine, données locales. */
export function DemoBanner() {
  const mode = useApp((s) => s.mode);
  return (
    <div className="relative z-40 overflow-hidden border-b border-volt/15 bg-volt/[0.06]">
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-2.5 px-4 text-xs text-fg-muted">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-volt/60" />
          <span className="relative size-2 rounded-full bg-volt" />
        </span>
        <FlaskConical className="hidden size-3.5 text-volt sm:block" aria-hidden />
        <p className="min-w-0 truncate">
          <strong className="font-semibold text-fg">{mode === "demo" ? "Mode démo" : "Projet vitrine"}</strong>
          <span className="hidden sm:inline">
            {" "}· {mode === "demo" ? "Données fictives, stockées" : "Vos données restent"} uniquement dans ce navigateur — aucun serveur, aucun compte.
          </span>
          <span className="sm:hidden"> · données locales uniquement</span>
        </p>
        <Link
          href="/app/reglages#donnees"
          className="ml-auto flex shrink-0 items-center gap-1 font-medium text-fg transition hover:text-volt"
        >
          <Info className="size-3.5" aria-hidden />
          Gérer
        </Link>
      </div>
    </div>
  );
}
