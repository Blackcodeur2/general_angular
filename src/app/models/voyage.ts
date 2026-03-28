export interface Voyage {
  id: number;
  chauffeur_id: number;
  vehicule_immatriculation: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string; // ISO date or "YYYY-MM-DD"
  heure_depart: string;
  statut: 'PROGRAMME' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  created_at?: string;
  updated_at?: string;
}
