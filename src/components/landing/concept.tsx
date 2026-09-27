import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    title: "Tu craques",
    body: "Chaque euro dépensé en fast-food devient une minute de dette (le taux est réglable).",
    visual: (
      <div className="flex items-center gap-3 font-mono text-sm">
        <span className="rounded-lg bg-white/5 px-2.5 py-1.5">🍔 13,90 €</span>
        <span className="text-fg-subtle">=</span>
        <span className="rounded-lg bg-ember/15 px-2.5 py-1.5 text-ember-soft">+14 min</span>
      </div>
    ),
  },
  {
    n: "02",
    title: "Tu t'entraînes un peu plus",
    body: "Ta séance standard est due quoi qu'il arrive. Seules les minutes au-delà remboursent la dette.",
    visual: (
      <div className="w-full space-y-2">
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          <div className="w-[72%] bg-fg-subtle/50" />
          <div className="flex-1 bg-volt" />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-fg-subtle uppercase">
          <span>60 min standard</span>
          <span className="text-volt">+14 remboursées</span>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "L'app planifie le reste",
    body: "La dette restante est répartie sur tes séances du mois. Tu sais toujours combien de temps faire, et quand.",
    visual: (
      <div className="flex gap-2">
        {[
          ["LUN", "74"],
          ["MER", "74"],
          ["SAM", "73"],
        ].map(([d, m]) => (
          <span key={d} className="rounded-xl border border-volt/25 bg-volt/[0.06] px-3 py-2 text-center">
            <span className="block font-mono text-[10px] text-fg-subtle">{d}</span>
            <span className="font-pixel text-base">{m}′</span>
          </span>
        ))}
      </div>
    ),
  },
];

export function Concept() {
  return (
    <section id="concept" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-volt">Le deal</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
            Une règle simple. <span className="text-fg-muted">Zéro culpabilité, juste des maths.</span>
          </h2>
        </Reveal>

        <ol className="mt-16 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="h-full">
              <li className="card group flex h-full flex-col p-7 transition duration-500 hover:-translate-y-1 hover:border-white/15">
                <span className="font-pixel text-5xl text-white/10 transition group-hover:text-volt/40">{s.n}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.body}</p>
                <div className="mt-auto flex min-h-16 items-end pt-8">{s.visual}</div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
