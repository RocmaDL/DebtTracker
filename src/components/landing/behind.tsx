import { ArrowUpRight, FileText } from "lucide-react";
import { REPO_URL } from "@/lib/site";
import { GithubIcon } from "../ui/github-icon";
import { Reveal } from "./reveal";

const STACK = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Motion", "Zustand", "Vitest", "Vercel"];

const DECISIONS = [
  {
    title: "Pas de backend, volontairement",
    body: "Projet vitrine : l'état vit dans Zustand, persisté en localStorage. Un jeu de démo réaliste est généré à partir de la date du jour, pour que l'app paraisse toujours vivante.",
  },
  {
    title: "Un moteur de calcul pur et testé",
    body: "Solde, planning, séries, badges : des fonctions pures, sans React, couvertes par des tests Vitest. L'interface ne fait que les afficher.",
  },
  {
    title: "Des dates en heure locale",
    body: "La V1 calculait les jours en UTC et décalait les séances d'un jour le soir. Toutes les dates sont désormais manipulées en heure locale.",
  },
  {
    title: "Une DA « night session »",
    body: "Noir profond, un vert volt pour l'effort, un orange ember pour la dette. Geist pour lire, Geist Pixel pour l'esprit tableau de stade.",
  },
];

export function Behind() {
  return (
    <section id="coulisses" className="hairline scroll-mt-24 border-t bg-ink-900/40 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="eyebrow text-volt">Coulisses</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">Un projet vitrine, fait comme un produit.</h2>
          <p className="mt-5 text-fg-muted">
            Parti d&apos;un prototype React Native inachevé, DebtTracker a été repensé de A à Z : user stories, parcours, design
            system, puis implémentation. Les données sont fictives, mais les choix, eux, sont réels.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Stack technique">
            {STACK.map((s) => (
              <li key={s} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-fg-muted">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-sm font-medium hover:text-volt">
              <GithubIcon className="size-4" /> Code source
              <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href={`${REPO_URL}/blob/main/docs/USER_STORIES.md`} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-sm font-medium hover:text-volt">
              <FileText className="size-4" /> Les 35 user stories
              <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>

        <ol className="space-y-3">
          {DECISIONS.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.08}>
              <li className="card flex gap-5 p-6">
                <span className="font-pixel text-2xl text-volt/60">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{d.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
