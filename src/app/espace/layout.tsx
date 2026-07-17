import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Navbar, type NavLink } from "@/components/layout/navbar";

const memberLinks: NavLink[] = [
  { href: "/espace", label: "Tableau de bord" },
  { href: "/espace/catalogue", label: "Catalogue" },
  { href: "/espace/reservations", label: "Mes réservations" },
];

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { name, role, isApproved } = session.user;

  // Membre non approuvé : la page "en attente" s'affiche en plein écran,
  // sans la barre de navigation (il n'a pas encore accès aux fonctions).
  if (role !== "ADMIN" && !isApproved) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full">
      <Navbar
        links={memberLinks}
        userName={name}
        homeHref="/espace"
        secondaryLink={
          role === "ADMIN"
            ? { href: "/admin", label: "Espace admin" }
            : undefined
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
