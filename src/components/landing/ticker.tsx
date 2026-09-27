import type { ExpenseCategory } from "@/lib/types";
import { PixelIcon } from "../ui/pixel-icon";
import { VelocityMarquee } from "./motion";

const ITEMS: [ExpenseCategory, string, string, string][] = [
  ["burger", "Burger", "12,90 €", "13 min"],
  ["pizza", "Pizza", "14,50 €", "15 min"],
  ["tacos", "Tacos XL", "9,50 €", "10 min"],
  ["kebab", "Kebab", "8,50 €", "9 min"],
  ["sushi", "Sushis", "18,00 €", "18 min"],
  ["sweet", "Donut", "4,50 €", "5 min"],
  ["other", "Frites", "3,80 €", "4 min"],
];

/** Bandeau défilant façon tableau de stade : il accélère et penche quand on scrolle. */
export function Ticker() {
  return (
    <div className="led-matrix hairline overflow-hidden border-y py-3.5" aria-label="Exemples de conversion au taux de 1 minute par euro">
      <div aria-hidden>
        <VelocityMarquee>
          {ITEMS.map(([cat, name, price, min]) => (
            <span key={name} className="flex items-center gap-3 font-pixel text-lg whitespace-nowrap">
              <PixelIcon name={cat} className="size-5 text-ember" />
              <span className="text-fg-muted uppercase">{name}</span>
              <span>{price}</span>
              <span className="text-ember">+{min}</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </div>
  );
}
