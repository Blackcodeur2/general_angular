import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agence } from '../../models/agence';
import { Gare } from '../../models/gare';
import { User } from '../../models/user';

export interface CreateAgencePayload {
  nom_agence: string;
  email_agence: string;
  telephone: string;
  bp?: string;
}

export interface CreateGerantPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  num_cni: string;
  date_naissance: string;
  agence_id: number;
  password: string;
  password_confirmation: string;
}

export interface CreateGarePayload {
  agence_id: number;
  ville: string;
  quartier: string;
  telephone: string;
}

@Injectable({ providedIn: 'root' })
export class ProprietaireService {
  private http = inject(HttpClient);
  private readonly API = 'http://127.0.0.1:8000/api';

  // ── Agences ──
  getMyAgences(): Observable<Agence[]> {
    return this.http.get<Agence[]>(`${this.API}/proprietaire/agences`);
  }

  createAgence(payload: CreateAgencePayload): Observable<Agence> {
    return this.http.post<Agence>(`${this.API}/proprietaire/agences`, payload);
  }

  updateAgence(id: number, payload: Partial<CreateAgencePayload>): Observable<Agence> {
    return this.http.put<Agence>(`${this.API}/proprietaire/agences/${id}`, payload);
  }

  deleteAgence(id: number): Observable<any> {
    return this.http.delete(`${this.API}/proprietaire/agences/${id}`);
  }

  // ── Gares ──
  createGare(payload: CreateGarePayload): Observable<Gare> {
    return this.http.post<Gare>(`${this.API}/proprietaire/gares`, payload);
  }

  // ── Gérants (CHEF_AGENCE) ──
  getMyGerants(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/proprietaire/gerants`);
  }

  createGerant(payload: CreateGerantPayload): Observable<User> {
    return this.http.post<User>(`${this.API}/proprietaire/gerants`, payload);
  }

  assignGerant(userId: number, agenceId: number): Observable<any> {
    return this.http.post(`${this.API}/proprietaire/gerants/assign`, {
      user_id: userId,
      agence_id: agenceId,
    });
  }

  removeGerant(userId: number): Observable<any> {
    return this.http.delete(`${this.API}/proprietaire/gerants/${userId}`);
  }
}
