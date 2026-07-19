import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        Cette page explique quelles données personnelles sont collectées sur
        ce site, pourquoi, et comment les faire respecter vos droits,
        conformément au Règlement Général sur la Protection des Données
        (RGPD).
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        Amicale des Sapeurs-Pompiers de Châteaubourg
        <br />
        8 Rue du Plessis Saint-Mélaine, 35220 Châteaubourg
        <br />
        <a href="mailto:reservationamicalechateaubourg@gmail.com">reservationamicalechateaubourg@gmail.com</a>
      </p>

      <h2>Données collectées</h2>
      <p>Lors de la création d&apos;un compte et de l&apos;utilisation du site, nous collectons :</p>
      <ul>
        <li>Nom, prénom, adresse e-mail</li>
        <li>Numéro de téléphone (facultatif)</li>
        <li>Mot de passe (stocké de façon chiffrée, jamais en clair)</li>
        <li>Historique des réservations de matériel (dates, matériel réservé)</li>
      </ul>

      <h2>Finalités</h2>
      <p>Ces données sont utilisées uniquement pour :</p>
      <ul>
        <li>Créer et gérer votre compte membre</li>
        <li>Traiter vos demandes de réservation de matériel</li>
        <li>Vous envoyer les e-mails nécessaires au fonctionnement du service (confirmation d&apos;inscription, réinitialisation de mot de passe, suivi de réservation)</li>
      </ul>

      <h2>Base légale</h2>
      <p>
        Le traitement de vos données repose sur l&apos;exécution du service que
        vous nous demandez (gestion de votre compte et de vos réservations)
        et sur l&apos;intérêt légitime de l&apos;association à gérer ses
        adhérents et son matériel.
      </p>

      <h2>Destinataires</h2>
      <p>
        Vos données ne sont accessibles qu&apos;aux administrateurs de
        l&apos;Amicale, dans le cadre de la gestion des réservations. Elles ne
        sont ni vendues, ni transmises à des tiers, ni utilisées à des fins
        publicitaires.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Vos données sont conservées tant que votre compte est actif. En cas
        d&apos;inactivité prolongée (plus de 3 ans) ou sur simple demande, elles
        sont supprimées.
      </p>

      <h2>Hébergement</h2>
      <p>
        Les données sont hébergées en France, chez o2switch (Clermont-Ferrand).
      </p>

      <h2>Cookies</h2>
      <p>
        Ce site utilise uniquement un cookie technique <strong>strictement
        nécessaire</strong> à votre connexion (maintien de votre session une
        fois identifié). Ce cookie ne sert ni à la publicité, ni au suivi de
        votre navigation, et ne nécessite donc pas de consentement préalable.
        Aucun autre cookie (statistiques, publicité, réseaux sociaux)
        n&apos;est utilisé sur ce site.
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
        rectification, d&apos;effacement et d&apos;opposition concernant vos
        données personnelles. Vous pouvez également demander un compte
        administrateur de désactiver ou supprimer votre compte à tout moment.
      </p>
      <p>
        Pour exercer ces droits, contactez-nous à :{" "}
        <a href="mailto:reservationamicalechateaubourg@gmail.com">reservationamicalechateaubourg@gmail.com</a>
      </p>
    </LegalPage>
  );
}
