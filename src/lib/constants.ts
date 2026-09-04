// Constantes métier partagées (valeurs autorisées pour les champs "texte"
// du schéma Prisma). Centraliser ici évite les fautes de frappe et facilite
// les évolutions.

/** Rôles utilisateur */
export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Statuts d'une réservation */
export const RESERVATION_STATUS = {
  /** Créée par le membre, en attente de validation de l'admin */
  EN_ATTENTE: "EN_ATTENTE",
  /** Validée par l'admin */
  CONFIRMEE: "CONFIRMEE",
  /** Annulée (par le membre ou l'admin) */
  ANNULEE: "ANNULEE",
  /** Réservation passée et terminée */
  TERMINEE: "TERMINEE",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

/**
 * Statuts qui "consomment" du stock : une réservation dans l'un de ces
 * statuts bloque la quantité de matériel sur sa période. Les réservations
 * ANNULEE ne consomment rien.
 */
export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.EN_ATTENTE,
  RESERVATION_STATUS.CONFIRMEE,
  RESERVATION_STATUS.TERMINEE,
];

/** Libellés lisibles pour l'affichage */
export const STATUS_LABELS: Record<ReservationStatus, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  ANNULEE: "Annulée",
  TERMINEE: "Terminée",
};

/**
 * Catégories de bénéficiaire pour la tarification d'un matériel à
 * "tarif selon bénéficiaire" (ex : la structure).
 */
export const BENEFICIAIRES = {
  CHATEAUBOURG: "CHATEAUBOURG",
  AUTRE_AMICALE: "AUTRE_AMICALE",
  AUTRE_ASSOCIATION: "AUTRE_ASSOCIATION",
} as const;

export type Beneficiaire = (typeof BENEFICIAIRES)[keyof typeof BENEFICIAIRES];

/** Libellés lisibles des bénéficiaires */
export const BENEFICIAIRE_LABELS: Record<Beneficiaire, string> = {
  CHATEAUBOURG: "Amicale de Châteaubourg",
  AUTRE_AMICALE: "Autre amicale",
  AUTRE_ASSOCIATION: "Autre association",
};

/** Ordre d'affichage des bénéficiaires (du moins au plus cher, en général) */
export const BENEFICIAIRE_ORDER: Beneficiaire[] = [
  BENEFICIAIRES.CHATEAUBOURG,
  BENEFICIAIRES.AUTRE_AMICALE,
  BENEFICIAIRES.AUTRE_ASSOCIATION,
];

/** Catégorie d'un membre, attribuée par l'admin lors de l'approbation. */
export const MEMBER_CATEGORIES = {
  CHATEAUBOURG: "CHATEAUBOURG",
  RETRAITE_CHATEAUBOURG: "RETRAITE_CHATEAUBOURG",
  DOMAGNE: "DOMAGNE",
  SERVON: "SERVON",
  AUTRE: "AUTRE",
} as const;

export type MemberCategory =
  (typeof MEMBER_CATEGORIES)[keyof typeof MEMBER_CATEGORIES];

export const MEMBER_CATEGORY_LABELS: Record<MemberCategory, string> = {
  CHATEAUBOURG: "Amicaliste Châteaubourg",
  RETRAITE_CHATEAUBOURG: "Amicaliste retraité Châteaubourg",
  DOMAGNE: "Amicaliste Domagné",
  SERVON: "Amicaliste Servon",
  AUTRE: "Autre",
};

export const MEMBER_CATEGORY_ORDER: MemberCategory[] = [
  MEMBER_CATEGORIES.CHATEAUBOURG,
  MEMBER_CATEGORIES.RETRAITE_CHATEAUBOURG,
  MEMBER_CATEGORIES.DOMAGNE,
  MEMBER_CATEGORIES.SERVON,
  MEMBER_CATEGORIES.AUTRE,
];

/**
 * Tarifs bénéficiaire qu'un membre peut choisir lors d'une réservation,
 * selon sa catégorie. Validé aussi côté serveur (pas seulement dans le
 * formulaire) dans src/lib/actions/reservation.ts.
 */
export const ALLOWED_BENEFICIAIRES: Record<MemberCategory, Beneficiaire[]> = {
  CHATEAUBOURG: [
    BENEFICIAIRES.CHATEAUBOURG,
    BENEFICIAIRES.AUTRE_AMICALE,
    BENEFICIAIRES.AUTRE_ASSOCIATION,
  ],
  RETRAITE_CHATEAUBOURG: [
    BENEFICIAIRES.CHATEAUBOURG,
    BENEFICIAIRES.AUTRE_AMICALE,
    BENEFICIAIRES.AUTRE_ASSOCIATION,
  ],
  DOMAGNE: [BENEFICIAIRES.AUTRE_AMICALE, BENEFICIAIRES.AUTRE_ASSOCIATION],
  SERVON: [BENEFICIAIRES.AUTRE_AMICALE, BENEFICIAIRES.AUTRE_ASSOCIATION],
  AUTRE: [BENEFICIAIRES.AUTRE_ASSOCIATION],
};
