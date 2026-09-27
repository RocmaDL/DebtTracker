import { Accessibility, CalendarDays, HardDrive, Sparkles, Timer, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

function MiniCalendar() {
  const states = "..d.m.d..x.d.dd..d.d..d..p.p...".split("");
  return (
    <div className="grid grid-cols-7 gap-1.5" aria-hidden>
      {states.slice(0, 28).map((s, i) => (
        <span
          key={i}
          className={cn(
            "grid aspect-square place-items-center rounded-md border border-white/[0.05] bg-white/[0.02]",
            i === 22 && "border-volt/50",
          )}
        >
          {s === "d" && <span className="size-2 rounded-full bg-volt shadow-[0_0_8px_rgb(212_255_58/0.7)]" />}
          {s === "m" && <span className="size-2 rounded-full border-2 border-ember" />}
          {s === "x" && <span className="h-0.5 w-2.5 rounded-full bg-ember" />}
          {s === "p" && <span className="size-2 rounded-full border border-dashed border-fg-subtle" />}
        </span>
      ))}
    </div>
  );
}

export function Features() {
  return (
    <section id="fonctionnalites" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-volt">Fonctionnalités</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
            Pensé comme une vraie app. <span className="text-fg-muted">Livré comme une page web.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid auto-rows-[minmax(0,auto)] gap-5 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <article className="card relative h-full overflow-hidden p-7 sm:p-9">
              <div className="pointer-events-none absolute -top-16 -right-16 size-72 rounded-full bg-volt/10 blur-3xl" />
              <Timer className="size-6 text-volt" />
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">Chrono plein écran</h3>
              <p className="mt-2 max-w-md text-sm text-fg-muted">
                Un anneau qui passe de l&apos;ambre au vert quand tu entres en zone de remboursement. Il survit au rechargement de la
                page et se réduit en pastille pendant que tu navigues.
              </p>
              <p className="mt-8 font-pixel text-[clamp(3.5rem,10vw,6.5rem)] leading-none tracking-tight text-fg" aria-hidden>
                01:12:<span className="text-volt">48</span>
              </p>
            </article>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.1}>
            <article className="card h-full p-7">
              <CalendarDays className="size-6 text-volt" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Calendrier lisible</h3>
              <p className="mt-2 mb-6 text-sm text-fg-muted">Séances honorées, manquées, bonus et écarts, d&apos;un coup d&apos;œil.</p>
              <MiniCalendar />
            </article>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.05}>
            <article className="card h-full p-7">
              <Sparkles className="size-6 text-amber" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Gamification</h3>
              <p className="mt-2 text-sm text-fg-muted">XP, 7 niveaux, séries et 11 badges. Confettis quand la dette tombe à zéro.</p>
              <div className="mt-6 flex -space-x-2" aria-hidden>
                {["👟", "🔥", "⏱️", "🪙", "🌿"].map((e, i) => (
                  <span key={e} className={cn("grid size-11 place-items-center rounded-2xl border-2 border-ink-850 text-lg", i < 3 ? "bg-gradient-to-br from-amber to-ember" : "bg-ink-750")}>
                    {e}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.1}>
            <article className="card h-full p-7">
              <Wand2 className="size-6 text-sky" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Plan automatique</h3>
              <p className="mt-2 text-sm text-fg-muted">
                La dette est répartie sur tes créneaux restants. Si la séance devient trop longue, l&apos;app te le dit.
              </p>
            </article>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.15}>
            <article className="card h-full p-7">
              <HardDrive className="size-6 text-fg" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">100 % local</h3>
              <p className="mt-2 text-sm text-fg-muted">Aucun serveur, aucun compte : tout vit dans le localStorage de ton navigateur.</p>
            </article>
          </Reveal>

          <Reveal className="md:col-span-6" delay={0.05}>
            <article className="card flex flex-col gap-6 p-7 sm:flex-row sm:items-center">
              <Accessibility className="size-6 shrink-0 text-volt" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold tracking-tight">Accessible par défaut</h3>
                <p className="mt-1 text-sm text-fg-muted">
                  Navigation au clavier (raccourci <kbd className="rounded bg-white/10 px-1.5 font-mono text-xs">N</kbd>), dialogues natifs avec
                  piège de focus, graphiques lisibles au lecteur d&apos;écran, animations coupées si tu préfères réduire les mouvements.
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
