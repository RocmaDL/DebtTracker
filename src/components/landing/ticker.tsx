const ITEMS = [
  ["🍔", "Burger", "12,90 €", "13 min"],
  ["🍕", "Pizza", "14,50 €", "15 min"],
  ["🌮", "Tacos XL", "9,50 €", "10 min"],
  ["🥙", "Kebab", "8,50 €", "9 min"],
  ["🍣", "Sushis", "18,00 €", "18 min"],
  ["🍩", "Donut", "4,50 €", "5 min"],
  ["🍟", "Frites", "3,80 €", "4 min"],
];

/** Bandeau défilant façon tableau d'affichage de stade. */
export function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="hairline relative overflow-hidden border-y bg-ink-900/60 py-4" aria-label="Exemples de conversion : 1 euro égale 1 minute">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
      <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none" aria-hidden>
        {row.map(([emoji, name, price, min], i) => (
          <span key={i} className="flex items-center gap-3 font-pixel text-lg whitespace-nowrap">
            <span className="font-sans">{emoji}</span>
            <span className="text-fg-muted uppercase">{name}</span>
            <span>{price}</span>
            <span className="text-fg-subtle">→</span>
            <span className="text-ember">+{min}</span>
            <span className="ml-6 text-fg-subtle/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
