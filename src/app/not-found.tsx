import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative">
        <p className="font-pixel text-[clamp(6rem,22vw,12rem)] leading-none text-ember">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="mt-2 text-fg-muted">Cette page a dû partir courir. Elle rembourse sa dette.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={buttonClass("secondary")}>
            Accueil
          </Link>
          <Link href="/app" className={buttonClass("primary")}>
            Ouvrir l’app
          </Link>
        </div>
      </div>
    </main>
  );
}
