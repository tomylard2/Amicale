import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Navbar, type NavLink } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ROLES } from "@/lib/constants";

const adminLinks: NavLink[] = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/materiel", label: "Matériel" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/factures", label: "Factures" },
  { href: "/admin/indisponibilites", label: "Indisponibilités" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role !== ROLES.ADMIN) redirect("/espace");

  return (
    <div className="min-h-full">
      <Navbar
        links={adminLinks}
        userName={session.user.name}
        homeHref="/admin"
        secondaryLink={{ href: "/espace", label: "Vue membre" }}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
