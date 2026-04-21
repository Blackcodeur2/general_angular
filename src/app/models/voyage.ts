import { Route } from './route';

export interface Voyage {
  id: number;
  num_voyage: string;
  gare_id?: number;
  trajet_id?: number;
  bus_id?: number;
  chauffeur_id?: number;
  code_bus: string;
  prix: number;
  places_disponibles?: number;
  statut: 'en attente' | 'en cours' | 'annule' | 'en voyage' | 'termine';
  date_depart: string;
  date_arrivee?: string;
  duree_heure?: number;
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
    nb_places: number;
    classe_bus: string;
  };
  trajet?: Route;
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
