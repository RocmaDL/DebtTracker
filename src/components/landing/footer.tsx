import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AUTHOR, REPO_URL } from "@/lib/site";
import { buttonClass } from "../ui/button";
import { Logo } from "../ui/logo";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-40">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] bg-[radial-gradient(ellipse_at_bottom,rgb(212_255_58/0.18),transparent_65%)]" />
      <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
        <p className="font-pixel text-sm tracking-widest text-volt uppercase">Insert coin</p>
        <h2 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-balance sm:text-7xl">Prêt à payer ta dette ?</h2>
        <p className="mx-auto mt-5 max-w-md text-fg-muted">9 semaines de données fictives t&apos;attendent. Aucune inscription, et tu peux tout effacer en un clic.</p>
        <Link href="/app" className={buttonClass("primary", "lg", "group mt-10 h-16 px-9 text-lg")}>
          Lancer la démo <ArrowRight className="size-5 transition group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="hairline border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-fg-subtle sm:flex-row sm:items-center sm:px-6">
        <Logo />
        <p className="sm:ml-4">
          Projet vitrine conçu et développé par <span className="text-fg-muted">{AUTHOR}</span>. Données fictives, stockage local, aucun
          tracking.
        </p>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="shrink-0 hover:text-fg sm:ml-auto">
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}
