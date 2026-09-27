import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const int = new Intl.NumberFormat("fr-FR");

export const formatEuro = (n: number) => euro.format(n);
export const formatInt = (n: number) => int.format(n);

/** 95 → « 1 h 35 », 45 → « 45 min ». */
export function formatDuration(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} h` : `${h} h ${String(rest).padStart(2, "0")}`;
}

/** Secondes → « 1:02:03 » ou « 02:03 ». */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const plural = (n: number, one: string, many = `${one}s`) => (Math.abs(n) >= 2 ? many : one);
