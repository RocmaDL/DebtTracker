import { Coins, Crown, Flame, Footprints, Hourglass, Leaf, Repeat, Shuffle, Sparkles, Timer, Zap, type LucideProps } from "lucide-react";
import type { Badge } from "@/lib/gamification";

const ICONS = {
  footprints: Footprints,
  sparkles: Sparkles,
  flame: Flame,
  zap: Zap,
  timer: Timer,
  coins: Coins,
  repeat: Repeat,
  hourglass: Hourglass,
  leaf: Leaf,
  shuffle: Shuffle,
  crown: Crown,
} satisfies Record<Badge["icon"], unknown>;

export function BadgeIcon({ icon, ...props }: { icon: Badge["icon"] } & LucideProps) {
  const Icon = ICONS[icon];
  return <Icon {...props} />;
}
