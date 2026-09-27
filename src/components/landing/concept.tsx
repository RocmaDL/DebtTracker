import { PixelIcon } from "../ui/pixel-icon";

const RULES = [
  ["Un euro, une minute.", "Chaque euro de fast-food ajoute une minute de dette. Le taux se règle de 0,5 à 3."],
  ["Seul l’effort en plus compte.", "Ta séance habituelle est due quoi qu’il arrive ; ce sont les minutes au-delà qui remboursent."],
  ["Pas de crédit.", "La dette ne descend jamais sous zéro : une grosse séance n’excuse pas les écarts de la semaine prochaine."],
];

export function Concept() {
  return (
    <section id="regle" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-28 sm:px-6 sm:py-40">
      <p className="max-w-5xl text-[clamp(2rem,5vw,4.25rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-fg-muted">
        Un burger{" "}
        <PixelIcon name="burger" className="inline size-[0.8em] -translate-y-[0.05em] align-baseline text-ember" /> à{" "}
        <span className="text-fg">13,90 €</span> ? Ça fait <span className="text-ember">14 minutes</span> de dette. Ta séance
        de lundi passe de <span className="text-fg line-through decoration-ember decoration-[0.08em]">60</span> à{" "}
        <span className="text-volt">74 minutes</span>, et l’ardoise est effacée.
      </p>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:mt-28 md:grid-cols-[14rem_1fr]">
        <h2 className="text-sm font-medium text-fg-subtle">Le règlement, en entier</h2>
        <ol className="hairline border-t">
          {RULES.map(([title, body], i) => (
            <li key={title} className="hairline grid grid-cols-[2.5rem_1fr] gap-4 border-b py-6 sm:grid-cols-[3rem_16rem_1fr] sm:gap-6">
              <span className="font-pixel text-lg text-fg-subtle">{i + 1}.</span>
              <h3 className="font-semibold">{title}</h3>
              <p className="col-start-2 text-fg-muted sm:col-start-3">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
