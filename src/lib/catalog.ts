import type { Activity, ExpenseCategory, Settings } from "./types";

export const CATEGORIES: Record<ExpenseCategory, { label: string; typical: number }> = {
  burger: { label: "Burger", typical: 12.9 },
  pizza: { label: "Pizza", typical: 14.5 },
  tacos: { label: "Tacos", typical: 9.5 },
  kebab: { label: "Kebab", typical: 8.5 },
  sushi: { label: "Sushi", typical: 18 },
  sweet: { label: "Sucré", typical: 4.5 },
  other: { label: "Autre", typical: 6 },
};

export const ACTIVITIES: Record<Activity, { label: string }> = {
  gym: { label: "Musculation" },
  run: { label: "Course" },
  bike: { label: "Vélo" },
  swim: { label: "Natation" },
  hiit: { label: "HIIT" },
  other: { label: "Autre" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as ExpenseCategory[];
export const ACTIVITY_KEYS = Object.keys(ACTIVITIES) as Activity[];

export const DEFAULT_SETTINGS: Settings = {
  name: "",
  rate: 1,
  standardDuration: 60,
  schedule: [
    { day: 1, time: "18:30" },
    { day: 4, time: "19:00" },
  ],
};

export const LIMITS = {
  amount: { min: 0.5, max: 500 },
  duration: { min: 1, max: 600 },
  rate: { min: 0.5, max: 3, step: 0.5 },
  standard: { min: 20, max: 120, step: 5 },
} as const;
