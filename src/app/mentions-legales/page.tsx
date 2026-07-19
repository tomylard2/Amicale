import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        Le présent site est édité par l&apos;<strong>Amicale des Sapeurs-Pompiers de
        Châteaubourg</strong>, association loi 1901.
      </p>
      <p>
        Siège social : 8 Rue du Plessis Saint-Mélaine, 35220 Châteaubourg
        <br />
        Contact : <a href="mailto:reservationamicalechateaubourg@gmail.com">reservationamicalechateaubourg@gmail.com</a>
      </p>

      <h2>Responsable de publication</h2>
      <p>Alexis Gaudiche, Président de l&apos;Amicale des Sapeurs-Pompiers de Châteaubourg.</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par :<br />
        o2switch SAS<br />
        Chemin des Pardiaux, 63000 Clermont-Ferrand, France<br />
        RCS Clermont-Ferrand 510 909 807<br />
        <a href="https://www.o2switch.fr" target="_blank" rel="noopener noreferrer">
          www.o2switch.fr
        </a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur ce site (textes, logo, mise en
        page) est la propriété de l&apos;Amicale des Sapeurs-Pompiers de
        Châteaubourg, sauf mention contraire. Toute reproduction sans
        autorisation est interdite.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données personnelles collectées sur ce site est
        détaillé dans notre{" "}
        <a href="/politique-de-confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative au site, vous pouvez nous contacter à
        l&apos;adresse : <a href="mailto:reservationamicalechateaubourg@gmail.com">reservationamicalechateaubourg@gmail.com</a>
      </p>
    </LegalPage>
  );
}
