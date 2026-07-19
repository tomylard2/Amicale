import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

/**
 * Habillage commun des pages d'authentification : arrière-plan immersif
 * sombre (photo + dégradé), panneau translucide centré avec le logo.
 */
export function AuthShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative min-h-[100svh] flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 -z-10 bg-slate-950 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(2,6,23,0.72), rgba(2,6,23,0.82)), url('/images/hero-caserne.jpg')",
        }}
        aria-hidden
      />
      <div
        className={cn(
          "w-full rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md shadow-2xl p-6 sm:p-8",
          wide ? "max-w-lg" : "max-w-md",
        )}
      >
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        {children}
      </div>
      <footer className="absolute bottom-4 inset-x-0 text-center text-xs text-slate-400">
        <Link href="/mentions-legales" className="hover:text-white underline underline-offset-2">
          Mentions légales
        </Link>
        <span className="mx-2">·</span>
        <Link
          href="/politique-de-confidentialite"
          className="hover:text-white underline underline-offset-2"
        >
          Politique de confidentialité
        </Link>
      </footer>
    </div>
  );
}
