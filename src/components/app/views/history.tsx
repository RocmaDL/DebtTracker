"use client";

import { Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useMemo, useState } from "react";
import { ACTIVITIES, CATEGORIES } from "@/lib/catalog";
import { formatRelative } from "@/lib/dates";
import { expenseMinutes, isExpense, isSession, sessionRepayment } from "@/lib/engine";
import type { Entry } from "@/lib/types";
import { useUI } from "@/lib/ui-store";
import { cn, formatEuro } from "@/lib/utils";
import { useDerived } from "@/hooks/use-derived";
import { useEntryActions } from "@/hooks/use-entry-actions";
import { Segmented } from "../../ui/segmented";
import { inputClass } from "../../ui/field";
import { EntryRow } from "../entry-row";

type Filter = "all" | "expense" | "session";

const searchable = (e: Entry) =>
  [e.note, e.kind === "expense" ? CATEGORIES[e.category].label : ACTIVITIES[e.activity].label, e.kind === "expense" ? "dépense fast-food" : "séance sport"]
    .join(" ")
    .toLowerCase();

export function HistoryView() {
  const d = useDerived();
  const open = useUI((s) => s.open);
  const { remove } = useEntryActions();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());

  const groups = useMemo(() => {
    const list = d.entries
      .filter((e) => filter === "all" || e.kind === filter)
      .filter((e) => !q || searchable(e).includes(q))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    const map = new Map<string, Entry[]>();
    for (const e of list) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return [...map.entries()];
  }, [d.entries, filter, q]);

  const count = groups.reduce((s, [, l]) => s + l.length, 0);

  return (
    <div className="space-y-5 lg:space-y-6">
      <header>
        <p className="eyebrow">Historique</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Toutes tes entrées</h1>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher : pizza, course, soirée…"
            aria-label="Rechercher dans l’historique"
            className={cn(inputClass, "pl-11")}
          />
        </div>
        <Segmented
          label="Filtrer"
          value={filter}
          onChange={setFilter}
          className="sm:w-96"
          options={[
            { value: "all", label: "Tout" },
            { value: "expense", label: "Écarts" },
            { value: "session", label: "Séances" },
          ]}
        />
      </div>

      <p className="text-xs text-fg-subtle" aria-live="polite">
        {count} {count > 1 ? "entrées" : "entrée"}
      </p>

      {groups.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
          <Search className="size-8 text-fg-subtle" aria-hidden />
          <p className="font-medium">Aucun résultat</p>
          <p className="text-sm text-fg-muted">{d.entries.length === 0 ? "Tu n’as encore rien enregistré." : "Essaie un autre mot-clé ou filtre."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([date, list]) => {
            const debt = list.filter(isExpense).reduce((s, e) => s + expenseMinutes(e, d.settings.rate), 0);
            const repaid = list.filter(isSession).reduce((s, e) => s + sessionRepayment(e), 0);
            const spent = list.reduce((s, e) => s + (e.kind === "expense" ? e.amount : 0), 0);
            return (
              <section key={date} className="card p-2 sm:p-3" aria-labelledby={`h-${date}`}>
                <header className="flex items-center justify-between px-3 pt-2 pb-1">
                  <h2 id={`h-${date}`} className="text-sm font-semibold">
                    {formatRelative(date, d.today)}
                  </h2>
                  <p className="font-mono text-[11px] text-fg-subtle tabular-nums">
                    {spent > 0 && <span>{formatEuro(spent)} · </span>}
                    {debt > 0 && <span className="text-ember-soft">+{debt}</span>}
                    {debt > 0 && repaid > 0 && " / "}
                    {repaid > 0 && <span className="text-volt">−{repaid}</span>}
                    {(debt > 0 || repaid > 0) && " min"}
                  </p>
                </header>
                <ul>
                  <AnimatePresence initial={false}>
                    {list.map((e) => (
                      <motion.li
                        key={e.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group/row relative flex items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <EntryRow entry={e} rate={d.settings.rate} onClick={() => open({ type: "entry", kind: e.kind, entry: e })} />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(e.id)}
                          aria-label="Supprimer l’entrée"
                          className="mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-fg-subtle transition hover:bg-ember/10 hover:text-ember-soft sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus-visible:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
