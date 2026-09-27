"use client";

import confetti from "canvas-confetti";

const COLORS = ["#d4ff3a", "#e6ff8f", "#ffffff", "#ffb547", "#6ad7ff"];

/** Pluie de confettis — ignorée si l'utilisateur préfère réduire les animations. */
export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 200, ticks: 260 };
  confetti({ ...base, particleCount: 90, spread: 70, startVelocity: 48, origin: { x: 0.5, y: 0.7 } });
  setTimeout(() => {
    confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } });
  }, 180);
}
