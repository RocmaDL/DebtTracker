import Link from "next/link";
import { REPO_URL } from "@/lib/site";
import { buttonClass } from "../ui/button";
import { Logo } from "../ui/logo";

const LINKS = [
  { href: "#regle", label: "La règle" },
  { href: "#simulateur", label: "Simulateur" },
  { href: "#dans-la-boite", label: "Dans la boîte" },
  { href: "#coulisses", label: "Coulisses" },
];

/** Barre plate, non collante : la landing se lit d’une traite. */
export function SiteNav() {
  return (
    <header className="hairline border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 sm:px-6">
        <Link href="/" aria-label="DebtTracker, accueil">
          <Logo />
        </Link>
        <nav aria-label="Sections" className="ml-auto hidden items-center gap-6 text-sm text-fg-muted md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">
            GitHub ↗
          </a>
        </nav>
        <Link href="/app" className={buttonClass("primary", "sm", "ml-auto md:ml-0")}>
          Ouvrir la démo
        </Link>
      </div>
    </header>
  );
}
