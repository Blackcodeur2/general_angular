import { Gare } from './gare';

export interface Agence {
    id: number;
    nom_agence: string;
    email_agence: string;
    telephone: string;
    bp: string;
    proprietaire: number,
    gares?: Gare[];
    statut: string;
    created_at?: string;
    updated_at?: string;
}
