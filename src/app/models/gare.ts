import { Ville } from './ville';

export interface Gare {
    id: number;
    nom: string;
    ville_id?: number;
    ville?: Ville;
    quartier?: string;
    adresse: string;
    telephone: string;
    agence_id: number;
    created_at?: string;
    updated_at?: string;
}