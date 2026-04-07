export interface User {
  id: number;
  num_cni: string;
  nom: string;
  prenom: string;
  email: string;
  date_naissance: string;
  telephone: string;
  gare_id: number;
  role_user: 'ADMIN' | 'CLIENT' | 'CHEF_AGENCE' | 'CHAUFFEUR' | 'AGENT' | 'CONTROLEUR' | 'PROPRIETAIRE';
  statut?: string,// 'NOT_STARTED' | 'en attente' | 'approuve' | 'rejete';
  created_at?: string;
  updated_at?: string;
}