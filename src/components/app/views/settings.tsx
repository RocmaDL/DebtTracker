"use client";

import { Database, ExternalLink, FileText, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { GithubIcon } from "../../ui/github-icon";
import { useState } from "react";
import { toast } from "sonner";
import { LIMITS } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import type { Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { Field, inputClass } from "../../ui/field";
import { Sheet } from "../../ui/sheet";
import { RangeField, ScheduleEditor } from "../onboarding";
import { REPO_URL } from "@/lib/site";

type Confirm = "demo" | "wipe" | null;

export function SettingsView() {
  const settings = useApp((s) => s.settings);
  const mode = useApp((s) => s.mode);
  const entries = useApp((s) => s.entries);
  const update = useApp((s) => s.updateSettings);
  const loadDemo = useApp((s) => s.loadDemo);
  const startFresh = useApp((s) => s.startFresh);
  const replay = useApp((s) => s.replayOnboarding);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const bytes = typeof window !== "undefined" ? (localStorage.getItem("debttracker:v1")?.length ?? 0) : 0;

  const toggleDay = (day: Weekday) => {
    const exists = settings.schedule.some((s) => s.day === day);
    if (exists && settings.schedule.length === 1) {
      toast.error("Garde au moins un jour d’entraînement", { description: "Sinon, impossible de répartir la dette." });
      return;
    }
    update({
      schedule: exists
        ? settings.schedule.filter((s) => s.day !== day)
        : [...settings.schedule, { day, time: "18:30" }].sort((a, b) => a.day - b.day),
    });
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <header>
        <p className="eyebrow">Réglages</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Tes règles du jeu</h1>
        <p className="mt-2 text-sm text-fg-muted">Chaque modification est enregistrée automatiquement et recalcule toute l’app.</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <Section title="Profil & règles" id="regles">
          <Field label="Prénom" htmlFor="name">
            <input id="name" className={inputClass} value={settings.name} maxLength={24} placeholder="Ton prénom" onChange={(e) => update({ name: e.target.value })} />
          </Field>
          <RangeField
            id="rate"
            label="Taux de conversion"
            value={settings.rate}
            {...LIMITS.rate}
            suffix="min / €"
            onChange={(rate) => update({ rate })}
          />
          <RangeField
            id="standard"
            label="Durée standard d’une séance"
            value={settings.standardDuration}
            {...LIMITS.standard}
            suffix="min"
            onChange={(standardDuration) => update({ standardDuration })}
          />
          <p className="rounded-lg bg-white/[0.03] p-3 text-xs text-fg-subtle">
            Le taux s’applique à tout l’historique. La durée standard, elle, est mémorisée séance par séance : changer la
            règle ne réécrit pas le passé.
          </p>
        </Section>

        <Section title="Planning hebdomadaire" id="planning">
          <p className="-mt-2 text-sm text-fg-muted">Ta dette est répartie équitablement sur ces créneaux jusqu’à la fin du mois.</p>
          <ScheduleEditor
            schedule={settings.schedule}
            onToggle={toggleDay}
            onTime={(day, time) => update({ schedule: settings.schedule.map((s) => (s.day === day ? { ...s, time } : s)) })}
          />
        </Section>

        <Section title="Données & démo" id="donnees">
          <div className="flex items-start gap-3 rounded-xl border border-volt/20 bg-volt/[0.05] p-4">
            <Database className="mt-0.5 size-5 shrink-0 text-volt" />
            <div className="text-sm">
              <p className="font-medium">{mode === "demo" ? "Tu explores le jeu de démo" : "Tu utilises tes propres données"}</p>
              <p className="mt-1 text-fg-muted">
                {entries.length} entrées · {(bytes / 1024).toFixed(1)} Ko dans le <code className="font-mono text-xs">localStorage</code> de ce navigateur. Aucune
                donnée n’est envoyée à un serveur.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => setConfirm("demo")}>
              <Sparkles className="size-4 text-volt" /> Recharger la démo
            </Button>
            <Button variant="secondary" onClick={() => setConfirm("wipe")}>
              <Trash2 className="size-4 text-ember" /> Partir de zéro
            </Button>
            <Button variant="ghost" className="sm:col-span-2" onClick={replay}>
              <RotateCcw className="size-4" /> Revoir l’introduction
            </Button>
          </div>
        </Section>

        <Section title="À propos" id="a-propos">
          <p className="text-sm text-fg-muted">
            DebtTracker est un <strong className="text-fg">projet vitrine</strong> conçu et développé par Rocma Dimba-Lau : pas de
            backend, pas de compte, uniquement Next.js, TypeScript et votre navigateur.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={linkClass}>
              <GithubIcon className="size-4" /> Code source <ExternalLink className="size-3 opacity-60" />
            </a>
            <a href={`${REPO_URL}/blob/main/docs/USER_STORIES.md`} target="_blank" rel="noreferrer" className={linkClass}>
              <FileText className="size-4" /> User stories <ExternalLink className="size-3 opacity-60" />
            </a>
          </div>
        </Section>
      </div>

      <Sheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        eyebrow="Confirmation"
        title={confirm === "wipe" ? "Effacer toutes les entrées ?" : "Recharger les données de démo ?"}
        description={
          confirm === "wipe"
            ? "Tes réglages sont conservés, mais l’historique, les badges et l’XP repartent de zéro."
            : "Les entrées actuelles seront remplacées par 9 semaines de données fictives."
        }
      >
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirm(null)}>
            Annuler
          </Button>
          <Button
            variant={confirm === "wipe" ? "ember" : "primary"}
            className="flex-1"
            onClick={() => {
              if (confirm === "wipe") {
                startFresh(settings);
              } else {
                loadDemo();
              }
              setConfirm(null);
            }}
          >
            {confirm === "wipe" ? "Tout effacer" : "Recharger"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

const linkClass = cn(
  "inline-flex h-10 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3.5 text-sm font-medium transition hover:border-white/20 hover:bg-white/[0.06]",
);

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="card scroll-mt-24 space-y-6 p-6">
      <h2 id={`${id}-t`} className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}
