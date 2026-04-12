export interface Route {
    id: number;
    depart: string;
    arrivee: string;
    prix: number;
    type_trajet: 'vip' | 'classique';
    depart_id: number;
    distance_km: number;
    arrivee_id: number;
    gare_id: number;
    created_at?: string;
    updated_at?: string;
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
}
