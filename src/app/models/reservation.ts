export interface Reservation {
  id: number;
  num_reservation: string;
  place: number | string;
  prix: number | number;
  statut: 'validee' | 'en_attente' | 'annule' | string;
  created_at: string;
  voyage: {
    id: number;
    date_depart: string;
    ville_depart: string;
    ville_arrivee: string;
    heure_depart: string;
    promo: number | boolean;
    numVoyage: string;
    statut: string;
    bus: {
      immatriculation: string;
      nb_places: number;
      modele: string;
      code_bus: string;
    };
    driver?: {
      name: string;
      phone: string;
    };
    trajet: {
      prix: string | number;
      depart: {
        nom: string;
        ville: string;
      };
      arrivee: {
        nom: string;
        ville: string;
      };
    };
    gare: {
      id: number;
      nom: string;
      ville: string;
      adresse: string;
      agence: {
        nom: string;
      };
    };
  };
  gare: {
    id: number;
    nom: string;
    ville: string;
    agence: {
      nom: string;
    };
  };
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  paiements: Array<{
    id: number;
    reference: string;
    montant: string | number;
    statut: string;
    created_at: string;
  }>;
}

export interface ReservationRequest {
  voyage_id: number;
  numero_siege: string;
}
