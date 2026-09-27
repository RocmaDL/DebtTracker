"use client";

import { Minus, Plus, Trash2, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ACTIVITIES, ACTIVITY_KEYS, CATEGORIES, CATEGORY_KEYS, LIMITS } from "@/lib/catalog";
import { formatRelative } from "@/lib/dates";
import { balanceAt, buildTimeline, expenseMinutes, sessionRepayment } from "@/lib/engine";
import { newId } from "@/lib/store";
import type { Activity, Entry, ExpenseCategory, ISODate } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { useDerived } from "@/hooks/use-derived";
import { useEntryActions } from "@/hooks/use-entry-actions";
import { Button } from "../ui/button";
import { Field, inputClass } from "../ui/field";
import { Segmented } from "../ui/segmented";

interface EntryFormProps {
  initialKind: "expense" | "session";
  initialDate?: ISODate;
  entry?: Entry;
  onDone: () => void;
}

const parseAmount = (s: string) => Number.parseFloat(s.replace(",", ".").replace(/\s/g, ""));

export function EntryForm({ initialKind, initialDate, entry, onDone }: EntryFormProps) {
  const d = useDerived();
  const { save, remove } = useEntryActions();
  const isEdit = Boolean(entry);

  const [kind, setKind] = useState<"expense" | "session">(entry?.kind ?? initialKind);
  const [date, setDate] = useState<ISODate>(entry?.date ?? (initialDate && initialDate <= d.today ? initialDate : d.today));
  const [note, setNote] = useState(entry?.note ?? "");

  const [category, setCategory] = useState<ExpenseCategory>(entry?.kind === "expense" ? entry.category : "burger");
  const [amount, setAmount] = useState(entry?.kind === "expense" ? String(entry.amount).replace(".", ",") : "");

  const [activity, setActivity] = useState<Activity>(entry?.kind === "session" ? entry.activity : "gym");
  const defaultDuration = date === d.today && d.plan.debt > 0 ? d.plan.recommended : d.settings.standardDuration;
  const [duration, setDuration] = useState(entry?.kind === "session" ? entry.duration : defaultDuration);
  const standard = entry?.kind === "session" ? entry.standard : d.settings.standardDuration;

  const [submitted, setSubmitted] = useState(false);
  const [identity] = useState(() => ({ id: entry?.id ?? newId(), createdAt: entry?.createdAt ?? Date.now() }));

  const amountValue = parseAmount(amount);
  const errors = {
    amount:
      kind !== "expense"
        ? null
        : !amount
          ? "Indique le montant dépensé."
          : Number.isNaN(amountValue) || amountValue < LIMITS.amount.min
            ? "Le montant doit être d'au moins 0,50 €."
            : amountValue > LIMITS.amount.max
              ? "Au-delà de 500 €, ce n'est plus un écart, c'est un banquet."
              : null,
    duration:
      kind !== "session"
        ? null
        : !Number.isFinite(duration) || duration < LIMITS.duration.min
          ? "Une séance dure au moins 1 minute."
          : duration > LIMITS.duration.max
            ? "10 heures maximum, même pour un ultra-trail."
            : null,
    date: !date ? "Choisis une date." : date > d.today ? "Impossible d'enregistrer une entrée dans le futur." : null,
  };
  const hasError = Object.values(errors).some(Boolean);

  const candidate: Entry | null = useMemo(() => {
    const base = { ...identity, date, note: note.trim() || undefined };
    if (kind === "expense") {
      if (Number.isNaN(amountValue) || amountValue <= 0) return null;
      return { ...base, kind, amount: Math.round(amountValue * 100) / 100, category };
    }
    if (!duration || duration <= 0) return null;
    return { ...base, kind, duration: Math.round(duration), activity, standard };
  }, [kind, amountValue, category, duration, activity, standard, date, note, identity]);

  /** Dette projetée après enregistrement. */
  const projected = useMemo(() => {
    if (!candidate) return null;
    const others = d.entries.filter((e) => e.id !== candidate.id);
    return balanceAt(buildTimeline([...others, candidate], d.settings, d.today), d.today);
  }, [candidate, d.entries, d.settings, d.today]);

  const currentWithoutThis = useMemo(() => {
    if (!entry) return d.debt;
    return balanceAt(buildTimeline(d.entries.filter((e) => e.id !== entry.id), d.settings, d.today), d.today);
  }, [entry, d.entries, d.settings, d.today, d.debt]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasError || !candidate) return;
    save(candidate, { isEdit });
    onDone();
  };

  const show = (key: keyof typeof errors) => (submitted ? errors[key] : null);

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-6 pt-1">
        {!isEdit && (
          <Segmented
            label="Type d'entrée"
            value={kind}
            onChange={(k) => {
              setKind(k);
              setSubmitted(false);
            }}
            options={[
              { value: "expense", label: <>🍔 Écart fast-food</>, tone: "ember" },
              { value: "session", label: <>💪 Séance de sport</>, tone: "volt" },
            ]}
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {kind === "expense" ? (
            <motion.div key="expense" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }} className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-fg-muted">Qu’est-ce qui t’a fait craquer ?</legend>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {CATEGORY_KEYS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={category === c}
                      onClick={() => {
                        setCategory(c);
                        if (!amount) setAmount(String(CATEGORIES[c].typical).replace(".", ","));
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-[11px] font-medium transition",
                        category === c
                          ? "border-ember/60 bg-ember/10 text-fg shadow-[inset_0_0_0_1px_rgb(255_91_58/0.3)]"
                          : "border-white/6 bg-ink-800 text-fg-muted hover:border-white/15 hover:text-fg",
                      )}
                    >
                      <span className="text-xl leading-none" aria-hidden>
                        {CATEGORIES[c].emoji}
                      </span>
                      {CATEGORIES[c].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Field label="Montant" htmlFor="amount" error={show("amount")}>
                <div className="relative">
                  <input
                    id="amount"
                    inputMode="decimal"
                    autoComplete="off"
                    autoFocus
                    placeholder={String(CATEGORIES[category].typical).replace(".", ",")}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
                    aria-invalid={Boolean(show("amount"))}
                    className={cn(inputClass, "h-16 pr-12 text-3xl font-semibold tracking-tight tabular-nums")}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-2xl font-semibold text-fg-subtle">€</span>
                </div>
              </Field>
            </motion.div>
          ) : (
            <motion.div key="session" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-fg-muted">Activité</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {ACTIVITY_KEYS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={activity === a}
                      onClick={() => setActivity(a)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-[11px] font-medium transition",
                        activity === a
                          ? "border-volt/60 bg-volt/10 text-fg shadow-[inset_0_0_0_1px_rgb(212_255_58/0.25)]"
                          : "border-white/6 bg-ink-800 text-fg-muted hover:border-white/15 hover:text-fg",
                      )}
                    >
                      <span className="text-xl leading-none" aria-hidden>
                        {ACTIVITIES[a].emoji}
                      </span>
                      {ACTIVITIES[a].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Field
                label="Durée"
                htmlFor="duration"
                error={show("duration")}
                aside={
                  !isEdit && d.plan.debt > 0 && date === d.today ? (
                    <button type="button" onClick={() => setDuration(d.plan.recommended)} className="flex items-center gap-1 text-xs font-medium text-volt hover:underline">
                      <Zap className="size-3" /> Recommandé : {d.plan.recommended} min
                    </button>
                  ) : null
                }
              >
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="icon" className="size-16 rounded-2xl" aria-label="Retirer 5 minutes" onClick={() => setDuration((v) => Math.max(1, (v || 0) - 5))}>
                    <Minus className="size-5" />
                  </Button>
                  <div className="relative flex-1">
                    <input
                      id="duration"
                      inputMode="numeric"
                      value={Number.isFinite(duration) ? duration : ""}
                      onChange={(e) => setDuration(Number.parseInt(e.target.value.replace(/\D/g, "") || "0", 10))}
                      aria-invalid={Boolean(show("duration"))}
                      className={cn(inputClass, "h-16 text-center text-3xl font-semibold tracking-tight tabular-nums")}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-fg-subtle">min</span>
                  </div>
                  <Button variant="secondary" size="icon" className="size-16 rounded-2xl" aria-label="Ajouter 5 minutes" onClick={() => setDuration((v) => Math.min(600, (v || 0) + 5))}>
                    <Plus className="size-5" />
                  </Button>
                </div>
                <StandardBar duration={duration} standard={standard} />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor="date" error={show("date")} hint={date ? formatRelative(date, d.today) : undefined}>
            <input id="date" type="date" max={d.today} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={Boolean(show("date"))} className={inputClass} />
          </Field>
          <Field label="Note (optionnel)" htmlFor="note">
            <input
              id="note"
              maxLength={60}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={kind === "expense" ? "Menu Best Of…" : "Jambes, fractionné…"}
              className={inputClass}
            />
          </Field>
        </div>

        {candidate && projected !== null && (
          <ImpactPreview
            kind={kind}
            delta={kind === "expense" ? expenseMinutes(candidate as { amount: number }, d.settings.rate) : sessionRepayment(candidate as { duration: number; standard: number })}
            before={currentWithoutThis}
            after={projected}
            rate={d.settings.rate}
          />
        )}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-6 flex gap-3 border-t border-white/7 bg-ink-900 px-5 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6">
        {isEdit && entry && (
          <Button
            variant="danger"
            size="lg"
            className="px-4"
            aria-label="Supprimer"
            onClick={() => {
              remove(entry.id);
              onDone();
            }}
          >
            <Trash2 className="size-5" />
          </Button>
        )}
        <Button type="submit" size="lg" variant={kind === "expense" ? "ember" : "primary"} className="flex-1">
          {isEdit ? "Enregistrer" : kind === "expense" ? "Ajouter la dépense" : "Enregistrer la séance"}
        </Button>
      </div>
    </form>
  );
}

function StandardBar({ duration, standard }: { duration: number; standard: number }) {
  const total = Math.max(duration, standard, 1);
  const surplus = Math.max(0, duration - standard);
  return (
    <div className="mt-3 space-y-1.5" aria-hidden>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-l-full bg-fg-subtle/60 transition-all" style={{ width: `${(Math.min(duration, standard) / total) * 100}%` }} />
        {surplus > 0 && <div className="h-full rounded-r-full bg-volt transition-all" style={{ width: `${(surplus / total) * 100}%` }} />}
      </div>
      <div className="flex justify-between font-mono text-[10px] text-fg-subtle uppercase">
        <span>Standard {standard} min</span>
        <span className={surplus > 0 ? "text-volt" : ""}>Surplus {surplus} min</span>
      </div>
    </div>
  );
}

function ImpactPreview({ kind, delta, before, after, rate }: { kind: "expense" | "session"; delta: number; before: number; after: number; rate: number }) {
  const isExpense = kind === "expense";
  const Icon = isExpense ? TrendingUp : TrendingDown;
  return (
    <motion.div
      layout
      aria-live="polite"
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4",
        isExpense ? "border-ember/25 bg-ember/[0.06]" : delta > 0 ? "border-volt/25 bg-volt/[0.05]" : "border-white/8 bg-white/[0.03]",
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", isExpense ? "bg-ember/15 text-ember" : "bg-volt/15 text-volt")}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold tabular-nums">
          {isExpense ? `+${delta} min de dette` : delta > 0 ? `Rembourse ${Math.min(delta, before)} min` : "Séance standard"}
        </p>
        <p className="text-xs text-fg-muted">
          {isExpense
            ? `Au taux de ${String(rate).replace(".", ",")} min / €`
            : delta > 0
              ? delta > before
                ? "Au-delà de ta dette : le surplus ne se stocke pas."
                : "Chaque minute au-delà du standard compte."
              : "Pas de remboursement, mais de l'XP et ta série continue."}
        </p>
      </div>
      <div className="text-right">
        <p className="eyebrow">Dette</p>
        <p className="font-mono text-sm tabular-nums">
          <span className="text-fg-subtle">{before}</span> → <span className={cn("font-semibold", after > before ? "text-ember-soft" : after < before ? "text-volt" : "text-fg")}>{formatDuration(after)}</span>
        </p>
      </div>
    </motion.div>
  );
}
