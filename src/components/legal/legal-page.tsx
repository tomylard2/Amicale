import Link from "next/link";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="text-sm text-primary hover:underline underline-offset-2"
        >
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-4 mb-8">{title}</h1>
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}
