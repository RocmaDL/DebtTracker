import type { Activity, ExpenseCategory, Settings } from "./types";

export const CATEGORIES: Record<ExpenseCategory, { label: string; emoji: string; typical: number }> = {
  burger: { label: "Burger", emoji: "🍔", typical: 12.9 },
  pizza: { label: "Pizza", emoji: "🍕", typical: 14.5 },
  tacos: { label: "Tacos", emoji: "🌮", typical: 9.5 },
  kebab: { label: "Kebab", emoji: "🥙", typical: 8.5 },
  sushi: { label: "Sushi", emoji: "🍣", typical: 18 },
  sweet: { label: "Sucré", emoji: "🍩", typical: 4.5 },
  other: { label: "Autre", emoji: "🍟", typical: 6 },
};

export const ACTIVITIES: Record<Activity, { label: string; emoji: string }> = {
  gym: { label: "Musculation", emoji: "🏋️" },
  run: { label: "Course", emoji: "🏃" },
  bike: { label: "Vélo", emoji: "🚴" },
  swim: { label: "Natation", emoji: "🏊" },
  hiit: { label: "HIIT", emoji: "🔥" },
  other: { label: "Autre", emoji: "🤸" },
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
