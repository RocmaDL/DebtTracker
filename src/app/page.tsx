import { Concept } from "@/components/landing/concept";
import { Features } from "@/components/landing/features";
import { FinalCta, SiteFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Manifesto } from "@/components/landing/manifesto";
import { Simulator } from "@/components/landing/simulator";
import { SiteNav } from "@/components/landing/site-nav";
import { Ticker } from "@/components/landing/ticker";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Ticker />
        <Concept />
        <section id="simulateur" className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-28 sm:px-6 sm:pb-36">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Combien coûte ton week-end ?</h2>
            <p className="max-w-xs text-sm text-fg-subtle">Compose ton panier, règle le taux : le plan se recalcule en direct.</p>
          </div>
          <Simulator />
        </section>
        <Features />
        <Manifesto />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
