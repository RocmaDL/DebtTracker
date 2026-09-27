"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { BADGES } from "@/lib/gamification";
import { useApp } from "@/lib/store";
import { useDerived } from "@/hooks/use-derived";
import { BadgeIcon } from "./badge-icon";

/** Annonce chaque badge nouvellement débloqué (une seule fois). */
export function BadgeWatcher() {
  const { badges } = useDerived();
  const seen = useApp((s) => s.seenBadges);
  const markSeen = useApp((s) => s.markBadgesSeen);

  useEffect(() => {
    const fresh = [...badges].filter((id) => !seen.includes(id));
    if (fresh.length === 0) return;
    markSeen(fresh);
    fresh.forEach((id, i) => {
      const badge = BADGES.find((b) => b.id === id);
      if (!badge) return;
      setTimeout(() => {
        toast(`Badge débloqué : ${badge.name}`, {
          description: badge.description,
          icon: <BadgeIcon icon={badge.icon} className="size-4 text-amber" />,
        });
      }, 600 + i * 400);
    });
  }, [badges, seen, markSeen]);

  return null;
}
