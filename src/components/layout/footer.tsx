import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
      <Link href="/mentions-legales" className="hover:text-foreground underline underline-offset-2">
        Mentions légales
      </Link>
      <span className="mx-2">·</span>
      <Link
        href="/politique-de-confidentialite"
        className="hover:text-foreground underline underline-offset-2"
      >
        Politique de confidentialité
      </Link>
    </footer>
  );
}
