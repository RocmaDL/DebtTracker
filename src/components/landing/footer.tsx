import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AUTHOR, REPO_URL } from "@/lib/site";
import { buttonClass } from "../ui/button";
import { Logo } from "../ui/logo";

export function FinalCta() {
  return (
    <section className="hairline border-t">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-10 px-5 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="font-pixel text-sm text-volt">
            Insert coin<span className="animate-blink motion-reduce:animate-none">_</span>
          </p>
          <h2 className="mt-6 text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.05em]">
            Prêt à payer
            <br />
            ta dette ?
          </h2>
        </div>
        <div className="lg:pb-3">
          <Link href="/app" className={buttonClass("primary", "lg", "group h-16 px-9 text-lg")}>
            Ouvrir la démo <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 max-w-64 text-sm text-fg-subtle">9 semaines de données fictives, effaçables en un clic.</p>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="hairline border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-fg-subtle sm:flex-row sm:items-center sm:gap-8 sm:px-6">
        <Logo />
        <p>
          Conçu et développé par <span className="text-fg-muted">{AUTHOR}</span>. Données fictives, stockage local, aucun traceur.
        </p>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="shrink-0 transition-colors hover:text-fg sm:ml-auto">
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}
