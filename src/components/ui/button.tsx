import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ember";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-volt text-ink-950 hover:bg-volt-soft",
  ember: "bg-ember text-ink-950 hover:bg-ember-soft",
  secondary: "bg-ink-750 text-fg hover:bg-ink-700 border border-white/8",
  ghost: "text-fg-muted hover:text-fg hover:bg-white/5",
  danger: "bg-ember/10 text-ember-soft hover:bg-ember/20 border border-ember/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-[10px]",
  lg: "h-14 px-7 text-base gap-2.5 rounded-[10px]",
  icon: "size-10 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(
    "inline-flex shrink-0 items-center justify-center font-semibold tracking-tight whitespace-nowrap select-none",
    "transition-[background-color,color,transform] duration-150 active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />;
});
