import { Behind } from "@/components/landing/behind";
import { Concept } from "@/components/landing/concept";
import { Features } from "@/components/landing/features";
import { FinalCta, SiteFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/landing/reveal";
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
        <section id="simulateur" className="scroll-mt-24 pb-8">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <Reveal className="mb-10 max-w-2xl">
              <p className="eyebrow text-volt">Simulateur</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
                Combien coûte ton week-end ?
              </h2>
            </Reveal>
            <Reveal>
              <Simulator />
            </Reveal>
          </div>
        </section>
        <Features />
        <Behind />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
