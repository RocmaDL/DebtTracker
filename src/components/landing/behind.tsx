import { REPO_URL } from "@/lib/site";

const STACK = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Motion", "Zustand", "Vitest", "Vercel"];

const DECISIONS = [
  ["Pas de backend, volontairement.", "L’état vit dans Zustand, persisté en localStorage. La démo est générée à partir de la date du jour, pour paraître toujours vivante."],
  ["Un moteur pur, testé.", "Solde, planning, séries, badges : des fonctions sans React, couvertes par Vitest. L’interface ne fait que les afficher."],
  ["Des dates en heure locale.", "La première version calculait en UTC et décalait les séances d’un jour le soir. Corrigé à la racine."],
  ["Un audit anti « AI slop ».", "Pas de dégradé, pas de halo, pas d’emoji : un tableau d’affichage, des pictogrammes pixel dessinés à la main, une seule idée poussée partout."],
];

export function Behind() {
  return (
    <section id="coulisses" className="hairline scroll-mt-8 border-t py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 sm:px-6 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <h2 className="text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">Un projet vitrine, construit comme un produit.</h2>
          <p className="mt-6 text-fg-muted">
            Parti d’un prototype React Native inachevé, DebtTracker a été repris de zéro : user stories, parcours, direction
            artistique, puis code. Les données sont fictives ; les décisions, elles, sont réelles.
          </p>
          <p className="mt-8 font-mono text-xs leading-relaxed text-fg-subtle">{STACK.join("  /  ")}</p>
          <ul className="mt-8 space-y-2 text-sm">
            <li>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-4 hover:decoration-volt">
                Code source sur GitHub ↗
              </a>
            </li>
            <li>
              <a href={`${REPO_URL}/blob/main/docs/USER_STORIES.md`} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-4 hover:decoration-volt">
                Les 35 user stories ↗
              </a>
            </li>
            <li>
              <a href={`${REPO_URL}/blob/main/docs/AUDIT_AI_SLOP.md`} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-4 hover:decoration-volt">
                L’audit de direction artistique ↗
              </a>
            </li>
          </ul>
        </div>

        <ol className="hairline border-t">
          {DECISIONS.map(([title, body], i) => (
            <li key={title} className="hairline grid grid-cols-[2.5rem_1fr] gap-4 border-b py-7">
              <span className="font-pixel text-lg text-volt">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-fg-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
