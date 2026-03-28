export interface Route {
    id: number;
    depart: string;
    arrivee: string;
    prix: number;
    type_trajet: 'vip' | 'classique';
    gare_id: number;
    created_at?: string;
    updated_at?: string;
}
