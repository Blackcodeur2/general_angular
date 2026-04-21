import { Ville } from './ville';

export interface Route {
    id: number;
    ville_depart_id?: number;
    ville_arrive_id?: number;
    ville_depart?: number;
    ville_arrive?: number;
    ville_depart_obj?: Ville;
    ville_arrivee?: Ville;
    
    // Legacy support from TrajetResource
    depart?: {
        nom: string;
    };
    arrivee?: {
        nom: string;
    };

    prix: number;
    type_trajet: 'vip' | 'classique';
    distance_km: number;
    duree_heure?: number;
    gare_id: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    
    // Relations
    gare?: any;
    
    total_reservations?: number;
}


