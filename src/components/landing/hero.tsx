import { ArrowRight, Lock, MonitorSmartphone, Timer } from "lucide-react";
import Link from "next/link";
import { REPO_URL } from "@/lib/site";
import { buttonClass } from "../ui/button";
import { GithubIcon } from "../ui/github-icon";
import { HeroVisual } from "./hero-visual";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pb-28">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-48 left-[10%] size-[520px] rounded-full bg-volt/[0.13] blur-[120px]" />
      <div className="pointer-events-none absolute top-40 right-[5%] size-[420px] rounded-full bg-ember/[0.12] blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-5 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pr-3 pl-1 text-xs text-fg-muted">
            <span className="rounded-full bg-volt px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-ink-950 uppercase">Vitrine</span>
            Projet portfolio · Next.js 16 · 100 % front
          </p>
          <h1 className="mt-6 text-[clamp(2.6rem,6.2vw,4.6rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
            <span className="block whitespace-nowrap">Chaque burger</span>
            <span className="block whitespace-nowrap">se paie</span>
            <span className="text-gradient-volt block animate-shimmer whitespace-nowrap">en minutes.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-muted">
            DebtTracker transforme tes écarts fast-food en <strong className="font-medium text-fg">dette de sport</strong>, puis la
            répartit sur tes prochaines séances. Pas de culpabilité : un plan.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/app" className={buttonClass("primary", "lg", "group")}>
              Lancer la démo
              <ArrowRight className="size-5 transition group-hover:translate-x-0.5" />
            </Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonClass("secondary", "lg")}>
              <GithubIcon className="size-5" /> Voir le code
            </a>
          </div>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-subtle">
            <li className="flex items-center gap-2">
              <Lock className="size-4" /> Aucun compte
            </li>
            <li className="flex items-center gap-2">
              <MonitorSmartphone className="size-4" /> Mobile first
            </li>
            <li className="flex items-center gap-2">
              <Timer className="size-4" /> Prêt en 5 secondes
            </li>
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
