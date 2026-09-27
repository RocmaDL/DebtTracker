"use client";

import { CalendarPlus, Dumbbell, Play, Timer, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRelative } from "@/lib/dates";
import { groupByDate, slotFor } from "@/lib/engine";
import { useApp } from "@/lib/store";
import { useUI, type EntrySheet } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { useDerived } from "@/hooks/use-derived";
import { useToday } from "@/hooks/use-today";
import { Button } from "../ui/button";
import { Sheet } from "../ui/sheet";
import { EntryForm } from "./entry-form";
import { EntryRow } from "./entry-row";

/** Hôte unique de toutes les feuilles modales de l'app. */
export function Sheets() {
  const sheet = useUI((s) => s.sheet);
  const openId = useUI((s) => s.openId);
  const close = useUI((s) => s.close);
  const open = useUI((s) => s.open);
  const todayDate = useToday();

  // Garde le dernier contenu affiché pendant l'animation de fermeture.
  const [shown, setShown] = useState<EntrySheet | null>(sheet);
  if (sheet && sheet !== shown) setShown(sheet);

  // Raccourci clavier : N = nouvelle entrée
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key.toLowerCase() === "n" && !useUI.getState().sheet) {
        e.preventDefault();
        open({ type: "quick" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const s = shown;
  const isOpen = sheet !== null;

  if (!s) return null;
  if (s.type === "quick") {
    return (
      <Sheet open={isOpen} onClose={close} eyebrow="Nouvelle entrée" title="Qu'est-ce qui s'est passé ?">
        <QuickActions />
      </Sheet>
    );
  }
  if (s.type === "day") {
    return (
      <Sheet open={isOpen} onClose={close} eyebrow="Détail du jour" title={formatRelative(s.date, todayDate)}>
        <DayDetail key={`${openId}`} date={s.date} />
      </Sheet>
    );
  }
  const editing = Boolean(s.entry);
  const kind = s.entry?.kind ?? s.kind;
  return (
    <Sheet
      open={isOpen}
      onClose={close}
      eyebrow={editing ? "Modifier" : "Nouvelle entrée"}
      title={kind === "expense" ? (editing ? "Écart fast-food" : "J'ai craqué") : editing ? "Séance" : "J'ai bougé"}
      description={kind === "expense" ? "Chaque euro devient des minutes à rembourser." : "Seules les minutes au-delà de ta durée standard remboursent."}
    >
      <EntryForm key={openId} initialKind={s.kind} initialDate={s.date} entry={s.entry} onDone={close} />
    </Sheet>
  );
}

function QuickActions() {
  const open = useUI((s) => s.open);
  const close = useUI((s) => s.close);
  const setTimerExpanded = useUI((s) => s.setTimerExpanded);
  const timer = useApp((s) => s.timer);
  const startTimer = useApp((s) => s.startTimer);
  const { plan, settings } = useDerived();

  const actions = [
    {
      icon: Utensils,
      title: "Écart fast-food",
      desc: "Burger, pizza, tacos… on convertit en minutes.",
      tone: "ember" as const,
      onClick: () => open({ type: "entry", kind: "expense" }),
    },
    {
      icon: Dumbbell,
      title: "Séance terminée",
      desc: "Saisis la durée d'une séance déjà faite.",
      tone: "volt" as const,
      onClick: () => open({ type: "entry", kind: "session" }),
    },
    {
      icon: timer ? Timer : Play,
      title: timer ? "Reprendre le chrono" : "Lancer le chrono",
      desc: timer ? "Une séance est en cours." : `Objectif du jour : ${plan.debt > 0 ? plan.recommended : settings.standardDuration} min.`,
      tone: "white" as const,
      onClick: () => {
        if (!timer) startTimer("gym", plan.debt > 0 ? plan.recommended : settings.standardDuration);
        setTimerExpanded(true);
        close();
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
      {actions.map(({ icon: Icon, title, desc, tone, onClick }) => (
        <button
          key={title}
          type="button"
          onClick={onClick}
          className={cn(
            "group flex items-center gap-4 rounded-2xl border p-4 text-left transition sm:flex-col sm:items-start sm:gap-6 sm:p-5",
            tone === "ember" && "border-ember/20 bg-ember/[0.06] hover:border-ember/50 hover:bg-ember/10",
            tone === "volt" && "border-volt/20 bg-volt/[0.05] hover:border-volt/50 hover:bg-volt/10",
            tone === "white" && "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
          )}
        >
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-xl transition group-hover:scale-105",
              tone === "ember" && "bg-ember text-ink-950",
              tone === "volt" && "bg-volt text-ink-950",
              tone === "white" && "bg-fg text-ink-950",
            )}
          >
            <Icon className="size-5" strokeWidth={2.2} />
          </span>
          <span>
            <span className="block font-semibold">{title}</span>
            <span className="mt-0.5 block text-xs text-fg-muted">{desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function DayDetail({ date }: { date: string }) {
  const open = useUI((s) => s.open);
  const d = useDerived();
  const list = (groupByDate(d.entries).get(date) ?? []).sort((a, b) => a.createdAt - b.createdAt);
  const slot = slotFor(date, d.settings.schedule);
  const isFuture = date > d.today;
  const hasSession = list.some((e) => e.kind === "session");
  const planned = d.plan.slots.find((p) => p.date === date);

  let status: { label: string; tone: string } | null = null;
  if (slot && hasSession) status = { label: `Séance planifiée à ${slot.time} — honorée`, tone: "text-volt" };
  else if (slot && date < d.today) status = { label: `Séance planifiée à ${slot.time} — manquée`, tone: "text-ember-soft" };
  else if (slot) status = { label: `Séance planifiée à ${slot.time}`, tone: "text-fg" };
  else if (hasSession) status = { label: "Séance bonus hors planning", tone: "text-volt" };

  return (
    <div className="space-y-5 pt-1">
      {status && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <CalendarPlus className="size-5 shrink-0 text-fg-subtle" />
          <div>
            <p className={cn("text-sm font-medium", status.tone)}>{status.label}</p>
            {planned && d.plan.debt > 0 && (
              <p className="text-xs text-fg-muted">
                Recommandé : <strong className="text-fg">{d.plan.recommended} min</strong> ({d.settings.standardDuration} + {d.plan.bonus} de remboursement)
              </p>
            )}
          </div>
        </div>
      )}

      {list.length > 0 ? (
        <div className="-mx-3">
          {list.map((e) => (
            <EntryRow key={e.id} entry={e} rate={d.settings.rate} onClick={() => open({ type: "entry", kind: e.kind, entry: e })} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-fg-subtle">
          {isFuture ? "Ce jour n'est pas encore arrivé." : "Rien d'enregistré ce jour-là."}
        </p>
      )}

      {!isFuture && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => open({ type: "entry", kind: "expense", date })}>
            <Utensils className="size-4 text-ember" /> Dépense
          </Button>
          <Button variant="secondary" onClick={() => open({ type: "entry", kind: "session", date })}>
            <Dumbbell className="size-4 text-volt" /> Séance
          </Button>
        </div>
      )}
    </div>
  );
}
