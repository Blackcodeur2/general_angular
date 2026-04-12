export interface Voyage {
  id: number;
  num_voyage: string;
  gare_id?: number;
  trajet_id?: number;
  bus_id?: number;
  chauffeur_id?: number;
  prix: number;
  places_disponibles?: number;
  statut: 'en attente' | 'en cours' | 'annule' | 'en voyage';
  date_depart: string;
  heure_depart?: string | null;

  // Relations and computed fields from API
  chauffeur?: {
    id: number;
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
    role_user?: string;
  };
  bus?: {
    id: number;
    immatriculation: string;
    code_bus: string;
  };
  trajet?: {
    id: number;
    depart_id: number;
    arrivee_id: number;
    prix?: number;
    depart?: {
      id: number;
      nom: string;
      ville: string;
    };
    arrivee?: {
      id: number;
      nom: string;
      ville: string;
    };
    gare_depart?: {
      id: number;
      nom: string;
      ville: string;
    };
    gare_arrivee?: {
      id: number;
      nom: string;
      ville: string;
    };
  };
  gare?: {
    id: number;
    nom: string;
    ville: string;
  };
  
  // Custom mapping from AgenceController
  vehicule_immatriculation?: string;
  ville_depart?: string;
  ville_arrivee?: string;

  created_at?: string;
  updated_at?: string;
}
