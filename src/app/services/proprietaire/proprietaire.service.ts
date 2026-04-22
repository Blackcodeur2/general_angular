import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Agence } from '../../models/agence';
import { Gare } from '../../models/gare';
import { User } from '../../models/user';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

export interface CreateAgencePayload {
  nom: string; // Correspond au backend
  email: string; // Correspond au backend
  telephone: string;
  adresse?: string; // Correspond au backend
}

export interface CreateGerantPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  num_cni: string;
  date_naissance: string;
  gare_id: number;
  password: string;
  password_confirmation: string;
}

export interface CreateGarePayload {
  agence_id: number;
  ville_id: number;
  quartier: string;
  telephone: string;
}


@Injectable({ providedIn: 'root' })
export class ProprietaireService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = environment.apiUrl;

  // ── Agences ──
  getMyAgences(): Observable<Agence[]> {
     const user = this.authService.currentUser();
    return this.http.get<Agence[]>(`${this.API}/proprietaire/mes-agences/${user?.id}`);
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
  getMyGares(): Observable<Gare[]> {
    return this.http.get<{ statut: boolean; data: Gare[] }>(`${this.API}/proprietaire/gares`)
      .pipe(map(response => response.data));
  }

  createGare(payload: CreateGarePayload): Observable<Gare> {
    return this.http.post<Gare>(`${this.API}/proprietaire/gares`, payload);
  }

  updateGare(id: number, payload: Partial<CreateGarePayload>): Observable<Gare> {
    return this.http.put<Gare>(`${this.API}/proprietaire/gares/${id}`, payload);
  }

  deleteGare(id: number): Observable<any> {
    return this.http.delete(`${this.API}/proprietaire/gares/${id}`);
  }

  // ── Buses ──
  getMyBuses(): Observable<any[]> {
    return this.http.get<{ statut: boolean; data: any[] }>(`${this.API}/proprietaire/buses`)
      .pipe(map(response => response.data));
  }

  // ── Routes/Trajets ──
  getMyTrajets(): Observable<any[]> {
    return this.http.get<{ statut: boolean; data: any[] }>(`${this.API}/proprietaire/trajets`)
      .pipe(map(response => response.data));
  }

  // ── Voyages ──
  getMyVoyages(): Observable<any[]> {
    return this.http.get<{ statut: boolean; data: any[] }>(`${this.API}/proprietaire/voyages`)
      .pipe(map(response => response.data));
  }

  // ── Utilisateurs ──
  getMyUtilisateurs(): Observable<User[]> {
    return this.http.get<{ statut: boolean; data: User[] }>(`${this.API}/proprietaire/utilisateurs`)
      .pipe(map(response => response.data));
  }

  // ── Statistiques ──
  getMyStatistics(): Observable<any> {
    return this.http.get<{ statut: boolean; data: any }>(`${this.API}/proprietaire/statistiques`)
      .pipe(map(response => response.data));
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

  // ── KYC ──
  getKycStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/proprietaire/kyc/status`);
  }

  submitKyc(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API}/proprietaire/kyc/submit`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  submitEntrepriseKyc(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API}/proprietaire/kyc/entreprise/submit`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
