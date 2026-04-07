export interface Bus {
    id: number;
    immatriculation: string;
    code_bus: string;
    type_bus: 'coaster' | 'gros porteur';
    classe_bus: 'vip' | 'classique';
    nb_places: number;
    gare_id: number;
    statut: 'disponible' | 'en voyage' | 'en maintenance' | 'indisponible';
    created_at?: string;
    updated_at?: string;
}
