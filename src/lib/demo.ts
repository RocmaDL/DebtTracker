import { CATEGORIES } from "./catalog";
import { addDays, eachDay, weekdayOf } from "./dates";
import type { Activity, Entry, ExpenseCategory, ISODate, Settings } from "./types";

export const DEMO_SETTINGS: Settings = {
  name: "Léo",
  rate: 1.5,
  standardDuration: 60,
  schedule: [
    { day: 1, time: "18:30" },
    { day: 3, time: "19:00" },
    { day: 6, time: "10:00" },
  ],
};

/** PRNG déterministe : la démo est la même à chaque rechargement pour une date donnée. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXPENSE_MIX: ExpenseCategory[] = ["burger", "burger", "pizza", "tacos", "kebab", "sushi", "sweet", "other"];
const NOTES: Partial<Record<ExpenseCategory, string[]>> = {
  burger: ["Menu Best Of", "Smash burger du midi", "Double cheese"],
  pizza: ["Soirée match", "4 fromages", "Pizza du vendredi"],
  tacos: ["Tacos XL", "Tacos 2 viandes"],
  kebab: ["Galette frites", "Sortie de soirée"],
  sushi: ["Plateau à partager"],
  sweet: ["Donut pause café", "Cookies"],
  other: ["Frites + milkshake"],
};
const ACTIVITY_MIX: Activity[] = ["gym", "gym", "gym", "run", "run", "bike", "hiit", "swim"];

/**
 * Génère ~9 semaines de données réalistes, datées relativement à `todayDate`
 * pour que la démo paraisse toujours « vivante ».
 */
export function generateDemo(todayDate: ISODate, weeks = 9): Entry[] {
  const rand = mulberry32(42);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const s = DEMO_SETTINGS;
  const start = addDays(todayDate, -7 * weeks);
  const scheduled = new Set(s.schedule.map((x) => x.day));
  const entries: Entry[] = [];
  let seq = 0;
  let balance = 0;
  const id = () => `demo-${++seq}`;
  const stamp = (date: ISODate) => new Date(`${date}T12:00:00`).getTime() + seq;

  // Les 6 dernières séances planifiées sont honorées → série en cours visible.
  const lastSlots = eachDay(start, addDays(todayDate, -1))
    .filter((d) => scheduled.has(weekdayOf(d)))
    .slice(-6);

  for (const date of eachDay(start, addDays(todayDate, -1))) {
    const wd = weekdayOf(date);

    // Dépenses : plus fréquentes le week-end.
    const chance = wd >= 5 ? 0.42 : 0.2;
    if (rand() < chance) {
      const category = pick(EXPENSE_MIX);
      const base = CATEGORIES[category].typical;
      const amount = Math.round((base * (0.8 + rand() * 0.45)) * 10) / 10;
      entries.push({
        id: id(),
        kind: "expense",
        date,
        amount,
        category,
        note: rand() < 0.7 ? pick(NOTES[category] ?? [""]) : undefined,
        createdAt: stamp(date),
      });
      balance += Math.round(amount * s.rate);
    }

    // Séances planifiées : ~85 % d’assiduité, durée calée sur la dette.
    const isSlot = scheduled.has(wd);
    const attends = lastSlots.includes(date) || (isSlot && rand() < 0.8);
    const extra = !isSlot && rand() < 0.05;
    if (attends || extra) {
      const effort = Math.min(45, Math.ceil(balance / 2)) + Math.round((rand() - 0.4) * 10);
      const duration = Math.max(35, s.standardDuration + effort);
      entries.push({
        id: id(),
        kind: "session",
        date,
        duration,
        activity: pick(ACTIVITY_MIX),
        standard: s.standardDuration,
        note: duration >= 90 ? "Grosse séance" : undefined,
        createdAt: stamp(date),
      });
      balance = Math.max(0, balance - Math.max(0, duration - s.standardDuration));
    }
  }

  // Deux craquages récents : il reste une dette à rembourser dans la démo.
  entries.push(
    {
      id: id(),
      kind: "expense",
      date: addDays(todayDate, -2),
      amount: 13.9,
      category: "burger",
      note: "Menu Best Of",
      createdAt: stamp(addDays(todayDate, -2)),
    },
    {
      id: id(),
      kind: "expense",
      date: addDays(todayDate, -1),
      amount: 16.5,
      category: "pizza",
      note: "Soirée match",
      createdAt: stamp(addDays(todayDate, -1)),
    },
  );

  return entries;
}
