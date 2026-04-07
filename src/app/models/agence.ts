import { Gare } from './gare';

export interface Agence {
    id: number;
    nom: string; // Correspond au backend
    email: string; // Correspond au backend
    telephone: string;
    adresse: string; // Correspond au backend (remplace bp)
    proprietaire_id: number; // Correspond au backend
    gares?: Gare[];
    statut?: string;
    created_at?: string;
    updated_at?: string;
    owner?: any; // Relation avec le propriétaire
}
