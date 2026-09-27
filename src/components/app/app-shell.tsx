"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";
import { LogoMark } from "../ui/logo";
import { BadgeWatcher } from "./badge-watcher";
import { DemoBanner } from "./demo-banner";
import { MobileHeader, Sidebar, TabBar } from "./nav";
import { Onboarding } from "./onboarding";
import { Sheets } from "./sheets";
import { TimerLayer } from "./timer";

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const onboarded = useApp((s) => s.onboarded);

  if (!hydrated) return <Splash />;

  return (
    <>
      <Toaster
        theme="dark"
        position="top-center"
        offset={48}
        toastOptions={{
          classNames: {
            toast: "!bg-ink-800/95 !backdrop-blur !border-white/10 !rounded-2xl !text-fg !shadow-2xl",
            description: "!text-fg-muted",
            actionButton: "!bg-volt !text-ink-950 !font-semibold !rounded-lg",
          },
        }}
      />
      {!onboarded ? (
        <Onboarding />
      ) : (
        <div className="flex min-h-dvh flex-col">
          <DemoBanner />
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <MobileHeader />
              <main id="contenu" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
                {children}
              </main>
            </div>
          </div>
          <TabBar />
          <Sheets />
          <TimerLayer />
          <BadgeWatcher />
        </div>
      )}
    </>
  );
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center" aria-busy="true" aria-label="Chargement">
      <div className="relative">
        <span className="absolute inset-0 animate-pulse-ring rounded-[9px] bg-volt/40" />
        <LogoMark className="relative size-12" />
      </div>
    </div>
  );
}
