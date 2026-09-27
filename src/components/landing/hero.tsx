import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import { buttonClass } from "../ui/button";
import { FadeUp, LineReveal } from "./motion";
import { Scoreboard } from "./scoreboard";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-14 px-5 pt-16 pb-20 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pb-28">
      <div>
        <h1 className="text-[clamp(3rem,7vw,5.4rem)] leading-[0.92] font-semibold tracking-[-0.055em]">
          <LineReveal
            lines={[{ text: "Chaque burger" }, { text: "se paie" }, { text: "en minutes.", className: "text-volt" }]}
            delay={0.1}
          />
        </h1>
        <FadeUp delay={0.55}>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-fg-muted">
            Chaque euro de fast-food devient une minute de sport à rembourser. L’app répartit la dette sur tes prochaines séances :
            tu sais toujours combien de temps faire, et quand.
          </p>
        </FadeUp>
        <FadeUp delay={0.7} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href="/app" className={buttonClass("primary", "lg", "group")}>
            Ouvrir la démo
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a href="#regle" className="text-sm font-medium text-fg-muted underline decoration-white/20 underline-offset-4 transition-colors hover:text-fg hover:decoration-volt">
            Comment ça marche
          </a>
        </FadeUp>
        <FadeUp delay={0.85}>
          <p className="mt-12 max-w-sm border-l-2 border-volt pl-4 text-sm text-fg-subtle">
            Projet vitrine imaginé par {AUTHOR}. Pas de compte, pas d’inscription : les données de démo restent sur ton appareil.
          </p>
        </FadeUp>
      </div>

      <FadeUp delay={0.35}>
        <Scoreboard />
      </FadeUp>
    </section>
  );
}
