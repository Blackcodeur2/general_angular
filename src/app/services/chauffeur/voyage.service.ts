import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
    return this.http.get<Voyage[]>(`${this.apiUrl}/chauffeur/voyages`);
  }

  // Get past trips completed by the chauffeur
  getHistoriqueChauffeur(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/chauffeur/historique`);
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
