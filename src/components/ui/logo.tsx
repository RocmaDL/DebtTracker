import { cn } from "@/lib/utils";

/** Monogramme : une barre de dette (ember) coupée par un éclair d’effort (volt). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#d4ff3a" />
      <path d="M8 22.5h9" stroke="#050607" strokeWidth="3" strokeLinecap="round" />
      <path d="M18.5 7 12 17h6l-2.5 8L23 14h-6l1.5-7Z" fill="#050607" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-pixel text-[1.05rem] leading-none tracking-tight">
        Debt<span className="text-volt">Tracker</span>
      </span>
    </span>
  );
}
