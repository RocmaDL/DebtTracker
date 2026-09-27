import { DrawnRow, PixelMorph, ScrollWords, type Token } from "./motion";

const SENTENCE: Token[] = [
  { text: "Un burger " },
  { icon: "burger", className: "text-ember" },
  { text: " à " },
  { text: "13,90 €", className: "text-fg" },
  { text: " ? Ça fait " },
  { text: "14 minutes", className: "text-ember" },
  { text: " de dette. Ta séance de lundi passe de " },
  { text: "60", className: "text-fg line-through decoration-ember decoration-[0.08em]" },
  { text: " à " },
  { text: "74 minutes,", className: "text-volt" },
  { text: " et l’ardoise est effacée." },
];

const RULES = [
  ["Un euro, une minute.", "Chaque euro de fast-food ajoute une minute de dette. Le taux se règle de 0,5 à 3."],
  ["Seul l’effort en plus compte.", "Ta séance habituelle est due quoi qu’il arrive ; ce sont les minutes au-delà qui remboursent."],
  ["Pas de crédit.", "La dette ne descend jamais sous zéro : une grosse séance n’excuse pas les écarts de la semaine prochaine."],
];

export function Concept() {
  return (
    <section id="regle" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-28 sm:px-6 sm:py-40">
      <ScrollWords
        tokens={SENTENCE}
        className="max-w-5xl text-[clamp(2rem,5vw,4.25rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-fg-muted"
      />

      <div className="mt-24 grid grid-cols-1 gap-12 sm:mt-32 md:grid-cols-[15rem_1fr] md:gap-16">
        <div className="md:sticky md:top-16 md:self-start">
          <PixelMorph from="burger" to="gym" className="w-44 sm:w-52" />
          <h2 className="mt-8 text-sm font-medium text-fg-subtle">Le règlement, en entier</h2>
        </div>
        <ol className="hairline border-t">
          {RULES.map(([title, body], i) => (
            <DrawnRow key={title} index={i} className="grid grid-cols-[2.5rem_1fr] gap-4 py-7 sm:grid-cols-[3rem_16rem_1fr] sm:gap-6">
              <span className="font-pixel text-lg text-fg-subtle">{i + 1}.</span>
              <h3 className="font-semibold">{title}</h3>
              <p className="col-start-2 text-fg-muted sm:col-start-3">{body}</p>
            </DrawnRow>
          ))}
        </ol>
      </div>
    </section>
  );
}
