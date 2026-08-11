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
