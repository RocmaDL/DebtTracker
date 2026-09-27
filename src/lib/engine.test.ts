import { describe, expect, it } from "vitest";
import { addDays, endOfMonth, toISODate, weekdayOf } from "./dates";
import { DEMO_SETTINGS, generateDemo } from "./demo";
import { balanceAt, buildTimeline, calendarMonth, computePlan, summarize } from "./engine";
import { BADGES, computeStreaks, levelFor, totalXp, unlockedBadges } from "./gamification";
import type { Entry, Settings } from "./types";

const settings: Settings = {
  name: "Test",
  rate: 1,
  standardDuration: 60,
  schedule: [
    { day: 1, time: "18:00" }, // lundi
    { day: 4, time: "19:00" }, // jeudi
  ],
};

let n = 0;
const expense = (date: string, amount: number): Entry => ({
  id: `e${++n}`,
  kind: "expense",
  date,
  amount,
  category: "burger",
  createdAt: n,
});
const session = (date: string, duration: number, standard = 60): Entry => ({
  id: `s${++n}`,
  kind: "session",
  date,
  duration,
  standard,
  activity: "gym",
  createdAt: n,
});

describe("dates", () => {
  it("formate en heure locale, sans décalage UTC", () => {
    expect(toISODate(new Date(2026, 0, 1, 0, 30))).toBe("2026-01-01");
    expect(toISODate(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });

  it("gère les semaines ISO (lundi = 1, dimanche = 7)", () => {
    expect(weekdayOf("2026-09-28")).toBe(1);
    expect(weekdayOf("2026-09-27")).toBe(7);
  });

  it("traverse les changements de mois et d'heure", () => {
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(endOfMonth("2028-02-10")).toBe("2028-02-29");
  });
});

describe("timeline", () => {
  it("convertit les euros en minutes selon le taux", () => {
    const t = buildTimeline([expense("2026-09-01", 12.4)], { ...settings, rate: 1.5 }, "2026-09-01");
    expect(t.at(-1)?.balance).toBe(19);
  });

  it("ne rembourse que le surplus au-delà du standard", () => {
    const t = buildTimeline([expense("2026-09-01", 30), session("2026-09-02", 75)], settings, "2026-09-02");
    expect(balanceAt(t, "2026-09-02")).toBe(15);
  });

  it("ne descend jamais sous zéro (pas de crédit stocké)", () => {
    const entries = [expense("2026-09-01", 10), session("2026-09-02", 120), expense("2026-09-03", 5)];
    const t = buildTimeline(entries, settings, "2026-09-03");
    expect(balanceAt(t, "2026-09-02")).toBe(0);
    expect(balanceAt(t, "2026-09-03")).toBe(5);
    expect(t[1].effectiveRepaid).toBe(10);
  });

  it("utilise le standard enregistré avec la séance", () => {
    const t = buildTimeline([expense("2026-09-01", 30), session("2026-09-02", 60, 45)], settings, "2026-09-02");
    expect(balanceAt(t, "2026-09-02")).toBe(15);
  });
});

describe("plan", () => {
  it("répartit la dette sur les séances restantes du mois", () => {
    // mardi 22/09/2026 → restent jeu 24, lun 28 = 2 séances
    const plan = computePlan([], settings, "2026-09-22", 45);
    expect(plan.slots.map((s) => s.date)).toEqual(["2026-09-24", "2026-09-28"]);
    expect(plan.bonus).toBe(23);
    expect(plan.recommended).toBe(83);
    expect(plan.spillsOver).toBe(false);
  });

  it("exclut aujourd'hui si la séance est déjà faite", () => {
    const plan = computePlan([session("2026-09-24", 70)], settings, "2026-09-24", 20);
    expect(plan.next?.date).toBe("2026-09-28");
  });

  it("déborde sur le mois suivant s'il ne reste aucune séance", () => {
    // mardi 29/09/2026 → plus de lundi/jeudi ce mois-ci
    const plan = computePlan([], settings, "2026-09-29", 40);
    expect(plan.spillsOver).toBe(true);
    expect(plan.next?.date).toBe("2026-10-01");
    expect(plan.slots).toHaveLength(4);
  });

  it("signale une séance trop lourde", () => {
    expect(computePlan([], settings, "2026-09-28", 200).heavy).toBe(true);
  });
});

describe("calendrier & résumés", () => {
  it("distingue séances faites, manquées, planifiées et bonus", () => {
    const entries = [session("2026-09-07", 60), session("2026-09-09", 60)];
    const days = calendarMonth(entries, settings, "2026-09-15", "2026-09-15");
    const state = (d: string) => days.find((x) => x.date === d)?.state;
    expect(state("2026-09-07")).toBe("done");
    expect(state("2026-09-09")).toBe("extra");
    expect(state("2026-09-10")).toBe("missed");
    expect(state("2026-09-17")).toBe("planned");
    expect(days.length % 7).toBe(0);
  });

  it("compte les séances manquées uniquement dans le passé", () => {
    const s = summarize([], settings, "2026-09-01", "2026-09-30", "2026-09-15");
    expect(s.scheduled).toBe(8);
    expect(s.missed).toBe(4);
  });
});

describe("gamification", () => {
  it("double les minutes de remboursement dans l'XP", () => {
    expect(totalXp([session("2026-09-01", 80)])).toBe(100);
  });

  it("calcule le niveau et la progression", () => {
    const l = levelFor(600);
    expect(l.level).toBe(2);
    expect(l.progress).toBeCloseTo(0.5);
    expect(levelFor(99_999).ceil).toBeNull();
  });

  it("compte la série sans casser sur la journée en cours", () => {
    const entries = [session("2026-09-07", 60), session("2026-09-10", 60), session("2026-09-14", 60)];
    // jeudi 17 pas encore fait : la série reste à 3
    expect(computeStreaks(entries, settings, "2026-09-17")).toEqual({ current: 3, best: 3 });
    // vendredi 18 : le jeudi est manqué
    expect(computeStreaks(entries, settings, "2026-09-18").current).toBe(0);
  });
});

describe("démo", () => {
  const today = "2026-09-27";
  const entries = generateDemo(today);
  const timeline = buildTimeline(entries, DEMO_SETTINGS, today);

  it("ne contient aucune entrée future", () => {
    expect(entries.every((e) => e.date <= today)).toBe(true);
  });

  it("laisse une dette à rembourser et une série en cours", () => {
    expect(balanceAt(timeline, today)).toBeGreaterThan(0);
    expect(computeStreaks(entries, DEMO_SETTINGS, today).current).toBeGreaterThanOrEqual(5);
  });

  it("débloque une partie des badges seulement", () => {
    const streaks = computeStreaks(entries, DEMO_SETTINGS, today);
    const unlocked = unlockedBadges({ entries, timeline, streaks, level: levelFor(totalXp(entries)), today });
    expect(unlocked.size).toBeGreaterThanOrEqual(4);
    expect(unlocked.size).toBeLessThan(BADGES.length);
  });

  it("reste cohérente quel que soit le jour", () => {
    for (let i = 0; i < 40; i++) {
      const d = addDays(today, i * 9);
      const e = generateDemo(d);
      const t = buildTimeline(e, DEMO_SETTINGS, d);
      expect(balanceAt(t, d)).toBeGreaterThan(0);
      expect(computePlan(e, DEMO_SETTINGS, d, balanceAt(t, d)).next).not.toBeNull();
      expect(e.some((x) => x.date > endOfMonth(d))).toBe(false);
    }
  });
});
