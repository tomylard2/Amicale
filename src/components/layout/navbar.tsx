import Link from "next/link";
import { SignOutButton } from "@/components/layout/sign-out-button";

export type NavLink = { href: string; label: string };

/**
 * Barre de navigation sombre (identité pompier) pour les espaces connectés.
 * Le contenu des pages, lui, reste sur fond clair pour une lecture confortable.
 */
export function Navbar({
  links,
  userName,
  homeHref,
  secondaryLink,
}: {
  links: NavLink[];
  userName?: string | null;
  homeHref: string;
  secondaryLink?: NavLink;
}) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href={homeHref} className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Amicale des Sapeurs-Pompiers de Châteaubourg"
            className="h-9 w-9 rounded-full"
          />
        </Link>

        <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-sm text-slate-200 hover:bg-slate-800 hover:text-white whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {secondaryLink && (
            <Link
              href={secondaryLink.href}
              className="inline-flex items-center h-8 px-2.5 rounded-md text-xs sm:text-sm font-medium border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white whitespace-nowrap transition-colors"
            >
              {secondaryLink.label}
            </Link>
          )}
          {userName && (
            <span className="hidden md:inline text-sm text-slate-400">
              {userName}
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
