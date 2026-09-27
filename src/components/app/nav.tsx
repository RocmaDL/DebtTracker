"use client";

import { CalendarDays, Home, ListOrdered, Plus, Settings, Trophy, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDerived } from "@/hooks/use-derived";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { Logo } from "../ui/logo";

export const NAV = [
  { href: "/app", label: "Accueil", icon: Home },
  { href: "/app/calendrier", label: "Calendrier", icon: CalendarDays },
  { href: "/app/historique", label: "Historique", icon: ListOrdered },
  { href: "/app/progression", label: "Progression", icon: Trophy },
  { href: "/app/reglages", label: "Réglages", icon: Settings },
] as const;

const isActive = (pathname: string, href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

export function Sidebar() {
  const pathname = usePathname();
  const open = useUI((s) => s.open);
  const { level } = useDerived();

  return (
    <aside className="hairline sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-ink-900/60 px-4 py-6 backdrop-blur lg:flex">
      <Link href="/" className="mb-8 px-2" aria-label="DebtTracker — retour au site">
        <Logo />
      </Link>

      <button
        type="button"
        onClick={() => open({ type: "quick" })}
        className="group mb-6 flex h-12 items-center gap-3 rounded-2xl bg-volt px-4 font-semibold text-ink-950 shadow-[0_8px_30px_-8px_rgb(212_255_58/0.55)] transition hover:bg-volt-soft active:scale-[0.98]"
      >
        <Plus className="size-5 transition group-hover:rotate-90" />
        Nouvelle entrée
        <kbd className="ml-auto rounded-md bg-ink-950/15 px-1.5 font-mono text-[11px]">N</kbd>
      </button>

      <nav aria-label="Navigation principale" className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active ? "text-fg" : "text-fg-muted hover:bg-white/[0.03] hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl border border-white/8 bg-white/[0.05]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Icon className={cn("relative size-[18px]", active && "text-volt")} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <Link href="/app/progression" className="card block p-4 transition hover:border-white/15">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Niv. {level.level}</span>
            <span className="font-mono text-[11px] text-fg-subtle tabular-nums">{level.xp} XP</span>
          </div>
          <p className="mt-1 font-semibold">{level.name}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-volt"
              initial={{ width: 0 }}
              animate={{ width: `${level.progress * 100}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 px-2 text-xs text-fg-subtle transition hover:text-fg">
          Découvrir le projet <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const { level } = useDerived();
  const pathname = usePathname();
  return (
    <header className="hairline sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-ink-950/80 px-4 backdrop-blur-xl lg:hidden">
      <Link href="/" aria-label="DebtTracker — retour au site">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/app/progression"
          className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 pr-3 pl-1 text-xs font-medium"
        >
          <span className="grid size-6 place-items-center rounded-full bg-volt font-mono text-[11px] font-bold text-ink-950">
            {level.level}
          </span>
          {level.name}
        </Link>
        <Link
          href="/app/reglages"
          aria-label="Réglages"
          aria-current={pathname.startsWith("/app/reglages") ? "page" : undefined}
          className="grid size-9 place-items-center rounded-full text-fg-muted transition hover:bg-white/5 hover:text-fg aria-[current=page]:text-volt"
        >
          <Settings className="size-[18px]" />
        </Link>
      </div>
    </header>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const open = useUI((s) => s.open);
  const items = NAV.slice(0, 4);
  const render = (item: (typeof NAV)[number]) => {
    const active = isActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn("relative flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors", active ? "text-fg" : "text-fg-subtle")}
      >
        <Icon className={cn("size-[22px]", active && "text-volt")} strokeWidth={active ? 2.2 : 1.8} />
        {item.label}
        {active && <motion.span layoutId="tab-active" className="absolute -top-px h-0.5 w-8 rounded-full bg-volt" />}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="hairline pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-ink-950/85 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch px-2">
        {items.slice(0, 2).map(render)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => open({ type: "quick" })}
            aria-label="Nouvelle entrée"
            className="-mt-5 grid size-14 place-items-center rounded-2xl bg-volt text-ink-950 shadow-[0_0_0_6px_var(--color-ink-950),0_10px_30px_-6px_rgb(212_255_58/0.6)] transition active:scale-95"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </button>
        </div>
        {items.slice(2).map(render)}
      </div>
    </nav>
  );
}
