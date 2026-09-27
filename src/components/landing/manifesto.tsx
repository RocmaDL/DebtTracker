import { AUTHOR } from "@/lib/site";
import { DrawnRow, LineReveal } from "./motion";

const PRINCIPLES = [
  ["Pas de morale.", "Un écart n’est pas une faute, c’est une dépense. On la note, on la rembourse, on passe à autre chose."],
  ["Des minutes, pas des calories.", "Compter en temps de sport parle à tout le monde : c’est concret, ça se ressent, et ça se planifie."],
  ["Un plan, pas une punition.", "La dette est étalée sur tes prochaines séances. Jamais de séance impossible, toujours une prochaine étape."],
  ["Et tout ça, pour de faux.", `DebtTracker est un projet vitrine imaginé par ${AUTHOR}. Les données sont fictives : explore, casse tout, recommence.`],
];

export function Manifesto() {
  return (
    <section id="manifeste" className="hairline scroll-mt-8 border-t py-24 sm:py-36">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <h2 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.045em] lg:sticky lg:top-16 lg:self-start">
          <LineReveal
            inView
            lines={[
              { text: "La culpabilité" },
              { text: "n’a jamais fait" },
              { text: "courir personne." },
              { text: "Un chiffre, si.", className: "text-volt" },
            ]}
          />
        </h2>

        <ol className="hairline border-t">
          {PRINCIPLES.map(([title, body], i) => (
            <DrawnRow key={title} index={i} className="grid grid-cols-[2.5rem_1fr] gap-4 py-8">
              <span className="font-pixel text-lg text-volt">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-fg-muted">{body}</p>
              </div>
            </DrawnRow>
          ))}
        </ol>
      </div>
    </section>
  );
}
