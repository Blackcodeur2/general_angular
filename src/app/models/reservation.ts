export interface Reservation {
  id: number;
  client_id: number;
  voyage_id: number;
  numero_siege: string;
  montant: number;
  statut: 'confirmee' | 'en_attente' | 'annulee';
  date_reservation: string;
  reference: string;
  voyage: {
    id: number;
    chauffeur_id?: number;
    vehicule_immatriculation: string;
    ville_depart: string;
    ville_arrivee: string;
    date_depart: string;
    heure_depart: string;
    statut: string;
    agence?: {
      id: number;
      nom: string;
      telephone: string;
      adresse: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface ReservationRequest {
  voyage_id: number;
  numero_siege: string;
}
