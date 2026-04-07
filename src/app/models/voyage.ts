export interface Voyage {
  id: number;
  chauffeur_id?: number;
  chauffeur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role_user: string;
    gare_id?: number;
  };
  vehicule_immatriculation: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string; // ISO date or "YYYY-MM-DD"
  heure_depart: string | null;
  statut: 'en attente' | 'en cours' | 'annule';
  created_at?: string;
  updated_at?: string;
}
