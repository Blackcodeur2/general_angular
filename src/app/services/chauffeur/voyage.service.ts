import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Voyage } from '../../models/voyage';
import { Incident } from '../../models/incident';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = `${environment.apiUrl}`;
  private incidentUrl = `${environment.apiUrl}/incidents`;

  constructor(private http: HttpClient) {}

  // Get current and upcoming program for the connected chauffeur
  getProgrammeChauffeur(): Observable<Voyage[]> {
    return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.apiUrl}/chauffeur/voyages`).pipe(
      map((res: { statut: boolean; data: Voyage[] }) => (res.data || []).map((v: any) => this.normalizeVoyage(v)))
    );
  }

  // Get past trips completed by the chauffeur
  getHistoriqueChauffeur(): Observable<Voyage[]> {
    return this.http.get<{ statut: boolean; data: Voyage[] }>(`${this.apiUrl}/chauffeur/voyages`).pipe(
      map((res: { statut: boolean; data: Voyage[] }) => (res.data || []).map((v: any) => this.normalizeVoyage(v)))
    );
  }

  private normalizeVoyage(v: any): Voyage {
    if (!v) return v;
    return {
      ...v,
      ville_depart: v.ville_depart || v.trajet?.gare_depart?.ville || v.trajet?.depart?.ville,
      ville_arrivee: v.ville_arrivee || v.trajet?.gare_arrivee?.ville || v.trajet?.arrivee?.ville,
      vehicule_immatriculation: v.vehicule_immatriculation || v.bus?.immatriculation,
      heure_depart: v.heure_depart || (v.date_depart ? new Date(v.date_depart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null)
    };
  }

  // Report an incident for a specific voyage
  signalerIncident(incident: Incident): Observable<any> {
    return this.http.post<any>(this.incidentUrl, incident);
  }

  // Update trip status (start, end, etc.)
  updateVoyageStatus(voyageId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${voyageId}/status`, { statut: status });
  }
}
