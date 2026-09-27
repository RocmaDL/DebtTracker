import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { REPO_URL } from "@/lib/site";
import { buttonClass } from "../ui/button";
import { GithubIcon } from "../ui/github-icon";
import { Logo } from "../ui/logo";

const LINKS = [
  { href: "#concept", label: "Concept" },
  { href: "#simulateur", label: "Simulateur" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#coulisses", label: "Coulisses" },
];

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex h-14 max-w-6xl items-center gap-6 rounded-2xl border border-white/8 bg-ink-950/70 px-4 backdrop-blur-xl sm:mx-4 lg:mx-auto">
        <Link href="/" aria-label="DebtTracker — accueil">
          <Logo />
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition hover:bg-white/5 hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Code source sur GitHub" className={buttonClass("ghost", "icon")}>
            <GithubIcon className="size-[18px]" />
          </a>
          <Link href="/app" className={buttonClass("primary", "sm")}>
            Lancer la démo <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
