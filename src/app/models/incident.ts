export interface Incident {
  id?: number;
  voyage_id: number;
  description: string;
  niveau_gravite: 'FAIBLE' | 'MOYEN' | 'ELEVÉ';
  date_signalement?: string;
  statut?: 'OUVERT' | 'TRAITE';
}
